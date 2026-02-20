import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlimtalkProvider } from '../notification/providers/alimtalk.provider';

@Controller('debug')
export class DebugController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alimtalk: AlimtalkProvider,
  ) {}

  // 정류장 이벤트 조회
  @Get('stop-events')
  async stopEvents(@Query('tripId') tripId: string) {
    return this.prisma.stopEvent.findMany({
      where: { tripId: Number(tripId) },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 탑승 로그 조회
  @Get('boarding')
  async boarding() {
    return this.prisma.boardingLog.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  // 알림 로그 조회
  @Get('notifications')
  async notifications() {
    return this.prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔥 알림톡 테스트 발송
  @Post('alimtalk-test')
  async alimtalkTest(@Body() body: { phone: string }) {
    return this.alimtalk.send(
      body.phone,
      `[학원버스]
버스가 곧 도착합니다.`,
    );
  }
}
