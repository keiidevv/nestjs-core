import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    // director 조회
    const director = await this.directorRepository.findOne({
      where: { id: createMovieDto.directorId },
    });

    if (!director) {
      throw new NotFoundException('Director not found');
    }

    // genre 조회
    const genres = await this.genreRepository.find({
      where: { id: In(createMovieDto.genreIds) },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `Genres not found: ${createMovieDto.genreIds.map((id) => `id: ${id}`)}`,
      );
    }

    // movie 생성
    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genres: genres,
      detail: {
        detail: createMovieDto.detail, // cascade 옵션으로 인해 자동 생성
      },
      director: director, // cascade 옵션으로 인해 자동 생성
    });

    return movie;
  }

  findAll(title?: string) {
    if (!title) {
      return this.movieRepository.find();
    }

    return this.movieRepository.findAndCount({
      where: { title: Like(`%${title}%`) },
      relations: ['detail', 'director'],
    });
  }

  findOne(id: number) {
    return this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director'],
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    let newDirector;
    let newGenres;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: { id: directorId },
      });
      if (!director) {
        throw new NotFoundException('Director not found');
      }
      newDirector = director;
    }

    if (genreIds) {
      const genres = await this.genreRepository.find({
        where: { id: In(genreIds) },
      });

      if (genres.length !== updateMovieDto.genreIds.length) {
        throw new NotFoundException(
          `Genres not found: ${updateMovieDto.genreIds.map((id) => `id: ${id}`)}`,
        );
      }
      newGenres = genres;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector ? { director: newDirector } : {}),
      ...(newGenres ? { genres: newGenres } : {}),
    };

    await this.movieRepository.update({ id }, movieUpdateFields);

    if (detail) {
      await this.movieDetailRepository.update(
        { id: movie.detail.id },
        { detail },
      );
    }

    const newMovie = this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    return newMovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete({ id: movie.detail.id });
    return { id };
  }
}
