import { IsEnum, IsInt } from 'class-validator';

export enum ArrivalMode {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
}

export class ArrivalDto {
  @IsInt()
  routeId!: number;

  @IsInt()
  stopId!: number;

  @IsEnum(ArrivalMode)
  mode!: ArrivalMode;
}
