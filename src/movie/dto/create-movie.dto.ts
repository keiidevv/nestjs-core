import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({
    message: 'title is required',
  })
  title: string;

  @IsArray()
  @ArrayNotEmpty({
    message: 'genre is required',
  })
  @IsNumber(
    {},
    {
      each: true, // 배열 요소마다 검증
    },
  )
  genreIds: number[];

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
