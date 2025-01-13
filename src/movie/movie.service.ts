import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // director 조회
      // repository 대신 manager 를 사용해서 transaction 을 사용할 수 있음
      const director = await queryRunner.manager.findOne(Director, {
        where: { id: createMovieDto.directorId },
      });

      if (!director) {
        throw new NotFoundException('Director not found');
      }

      // genre 조회
      const genres = await queryRunner.manager.find(Genre, {
        where: { id: In(createMovieDto.genreIds) },
      });

      if (genres.length !== createMovieDto.genreIds.length) {
        throw new NotFoundException(
          `Genres not found: ${createMovieDto.genreIds.map((id) => `id: ${id}`)}`,
        );
      }

      /**
       * query builder 를 사용하는 경우 (전반적인 jdsl 비슷)
       *  -> quiry builder 는 쿼리러너를 사용하지 않음
       *
       * const movieDetail = await this.movieDetailRepository.createQueryBuilder('movieDetail')
       * .insert()
       * .into(MovieDetail)
       * .values({
       *  detail: createMovieDto.detail,
       * })
       * .execute();
       *
       * cosnt movieDetailId = movieDetail.raw[0].id;
       *
       * const movie = await this.movieRepository.createQueryBuilder('movie')
       * .insert()
       * .into(Movie)
       * .values({
       *  title: createMovieDto.title,
       *  detail: { id: movieDetailId },
       *  director: { id: directorId },
       * })
       * .execute(); // 다대다는 설정되지 않으므로 별도로 진행해줘야함
       *
       * await this.movieDetailRepository.update({ id: movieDetailId }, { movie: { id: movie.raw[0].id } });
       * await this.genreRepository.update({ id: In(createMovieDto.genreIds) }, { movie: { id: movie.raw[0].id } });
       */

      // movie 생성
      const movie = await queryRunner.manager.save(Movie, {
        title: createMovieDto.title,
        genres: genres,
        detail: {
          detail: createMovieDto.detail, // cascade 옵션으로 인해 자동 생성
        },
        director: director, // cascade 옵션으로 인해 자동 생성
      });

      await queryRunner.commitTransaction();
      return movie;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 오류 발생 시 롤백
      throw error;
    } finally {
      await queryRunner.release(); // 쿼리러너 해제
    }
  }

  async findAll(title?: string) {
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      // title이 존재할 때에만 조건 필터
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    return qb.getManyAndCount();

    // if (!title) {
    //   return this.movieRepository.find();
    // }

    // return this.movieRepository.findAndCount({
    //   where: { title: Like(`%${title}%`) },
    //   relations: ['detail', 'director'],
    // });
  }

  findOne(id: number) {
    return this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director'],
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movie = await queryRunner.manager.findOne(Movie, {
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
        const director = await queryRunner.manager.findOne(Director, {
          where: { id: directorId },
        });
        if (!director) {
          throw new NotFoundException('Director not found');
        }
        newDirector = director;
      }

      if (genreIds) {
        const genres = await queryRunner.manager.find(Genre, {
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

      await queryRunner.manager.update(Movie, { id }, movieUpdateFields);

      if (detail) {
        await queryRunner.manager.update(
          MovieDetail,
          { id: movie.detail.id },
          { detail },
        );
      }

      const newMovie = await queryRunner.manager.findOne(Movie, {
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });

      await queryRunner.commitTransaction();
      return newMovie;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
