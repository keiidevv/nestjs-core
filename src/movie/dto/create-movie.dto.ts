import { IsString, IsNotEmpty } from 'class-validator';
import { Genre } from 'src/genre/entity/genre.entity';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({
    message: 'title is required',
  })
  title: string;

  @IsString()
  @IsNotEmpty({
    message: 'genre is required',
  })
  genres: Genre[];

  @IsString()
  @IsNotEmpty({
    message: 'detail is required',
  })
  detail: string;

  @IsString()
  @IsNotEmpty({
    message: 'directorId is required',
  })
  directorId: string;
}
