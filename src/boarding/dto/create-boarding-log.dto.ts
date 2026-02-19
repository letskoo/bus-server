import { IsEnum, IsInt } from 'class-validator';
import { BoardingStatus } from '@prisma/client';

export class CreateBoardingLogDto {
  @IsInt()
  studentId!: number;

  @IsInt()
  routeId!: number;

  @IsInt()
  stopId!: number;

  @IsEnum(BoardingStatus)
  status!: BoardingStatus;
}
