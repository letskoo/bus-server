import { Body, Controller, Get, Post, Query, Param } from '@nestjs/common';
import { BoardingService } from './boarding.service';
import { CreateBoardingLogDto } from './dto/create-boarding-log.dto';

@Controller('boardings')
export class BoardingController {
  constructor(private readonly boardingService: BoardingService) {}

  @Post()
  create(@Body() body: CreateBoardingLogDto) {
    return this.boardingService.create(body);
  }

  @Get()
  findAll(@Query('routeId') routeId?: string) {
    const parsed = routeId ? Number(routeId) : undefined;
    return this.boardingService.findAll(parsed);
  }

  // 🔥🔥🔥 기사앱 오늘 노선 (임시탑승 포함)
  @Get('/today/:routeId')
  today(@Param('routeId') routeId: string) {
    return this.boardingService.getTodayBoardingList(Number(routeId));
  }
}