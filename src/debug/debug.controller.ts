import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('debug')
export class DebugController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stop-events')
  async stopEvents(@Query('tripId') tripId: string) {
    return this.prisma.stopEvent.findMany({
      where: { tripId: Number(tripId) },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Get('boarding')
  async boarding(@Query('tripId') tripId: string) {
    return this.prisma.boardingLog.findMany({
      where: { tripId: Number(tripId) },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Get('notifications')
  async notifications() {
    return this.prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
