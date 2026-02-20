import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('temporary')
export class TemporaryQueryController {
  constructor(private readonly prisma: PrismaService) {}

  // 🔥 기사앱 오늘 임시탑승 조회
  @Get('/today/:routeId')
  async today(@Param('routeId') routeId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate()+1);

    return this.prisma.temporaryBoarding.findMany({
      where:{
        routeId: Number(routeId),
        targetDate:{
          gte: today,
          lt: tomorrow,
        },
        status:'ACTIVE'
      },
      orderBy:{
        targetTime:'asc'
      }
    });
  }
}