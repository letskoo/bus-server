import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
