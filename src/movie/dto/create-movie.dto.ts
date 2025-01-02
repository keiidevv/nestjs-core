import { IsString, IsNotEmpty } from 'class-validator';

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
  genre: string;
}
