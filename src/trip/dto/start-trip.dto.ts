import { IsEnum, IsInt } from 'class-validator';
import { TripType } from '@prisma/client';

export class StartTripDto {
  @IsInt()
  routeId!: number;

  @IsEnum(TripType)
  type!: TripType;
}
