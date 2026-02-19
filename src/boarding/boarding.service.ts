import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardingLogDto } from './dto/create-boarding-log.dto';

@Injectable()
export class BoardingService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBoardingLogDto) {
    return this.prisma.boardingLog.create({ data });
  }

  findAll(routeId?: number) {
    if (routeId !== undefined) {
      return this.prisma.boardingLog.findMany({
        where: { routeId },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.boardingLog.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
