import { Controller, Get, Query } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  balance(@Query('organizationId') organizationId: string) {
    return this.pointsService.getBalance(Number(organizationId));
  }

  @Get('history')
  history(@Query('organizationId') organizationId: string, @Query('take') take?: string) {
    return this.pointsService.history(Number(organizationId), take ? Number(take) : 50);
  }
}

