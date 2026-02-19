// src/driver/dto/update-location.dto.ts

import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLocationDto {
  @Type(() => Number)
  @IsNumber()
  routeId!: number;

  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;
}
