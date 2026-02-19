import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TripService } from './trip.service';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post('start')
  start(@Body() body: { routeId: number; type: string }) {
    return this.tripService.start(Number(body.routeId), body.type);
  }

  @Post(':tripId/end')
  end(@Param('tripId') tripId: string) {
    return this.tripService.end(Number(tripId));
  }

  @Get('active')
  active(@Query('routeId') routeId: string, @Query('type') type?: string) {
    return this.tripService.getActive(Number(routeId), type);
  }
}
