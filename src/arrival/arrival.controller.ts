import { Body, Controller, Post } from '@nestjs/common';
import { ArrivalService } from './arrival.service';
import { ArrivalDto } from './dto/arrival.dto';

@Controller('arrival')
export class ArrivalController {
  constructor(private readonly arrivalService: ArrivalService) {}

  @Post()
  create(@Body() body: ArrivalDto) {
    return this.arrivalService.create(body);
  }
}
