import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}
