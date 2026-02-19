// src/stop/dto/create-stop.dto.ts

import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStopDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  routeId!: number;

  @Type(() => Number)
  @IsNumber()
  orderNo!: number;

  @Type(() => Number)
  @IsNumber()
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  lng!: number;
}
