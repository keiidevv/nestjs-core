import { IsDate, IsOptional } from 'class-validator';

export class UpdateDirectorDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsDate()
  dob?: Date;

  @IsOptional()
  nationality?: string;
}
