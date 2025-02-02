import { PartialType } from '@nestjs/swagger';
import { CreateGenreDto } from './create-genre.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateGenreDto {
  @IsOptional()
  @IsString()
  name?: string;
}
