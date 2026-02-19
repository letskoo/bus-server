import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @Length(1, 50)
  name!: string;

  @IsString()
  @Length(8, 20)
  phone!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
