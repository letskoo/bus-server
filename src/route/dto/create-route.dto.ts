import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRouteDto {
  @IsInt()
  organizationId!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  busId?: number;
}
