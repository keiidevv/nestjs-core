import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  create(createMovieDto: CreateMovieDto) {
    return this.movieRepository.save(createMovieDto);
  }

  findAll(title?: string) {
    return this.movieRepository.find({ where: { title } });
  }

  findOne(id: number) {
    return this.movieRepository.findOne({ where: { id } });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    await this.movieRepository.save({ ...movie, ...updateMovieDto });
    return this.movieRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    await this.movieRepository.delete(id);
    return { id };
  }
}
