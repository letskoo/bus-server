import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsInt()
  stopId?: number | null;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;
}
