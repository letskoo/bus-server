import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemporaryService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organizationId: number;
    routeId: number;
    stopId: number;
    studentName: string;
    studentPhoneLast4?: string;
    targetDate: string;
    targetTime: string;
    createdBy: 'PARENT' | 'DIRECTOR';
  }) {
    const date = new Date(data.targetDate);

    const exist = await this.prisma.temporaryBoarding.findFirst({
      where: {
        organizationId: data.organizationId,
        studentName: data.studentName,
        targetDate: date,
        status: 'ACTIVE',
      },
    });

    if (exist) {
      throw new Error('이미 해당 날짜 임시탑승 신청 있음');
    }

    return this.prisma.temporaryBoarding.create({
      data: {
        organizationId: data.organizationId,
        routeId: data.routeId,
        stopId: data.stopId,
        studentName: data.studentName,
        studentPhoneLast4: data.studentPhoneLast4,
        targetDate: date,
        targetTime: data.targetTime,
        createdBy: data.createdBy,
      },
    });
  }

  async cancel(id: number) {
    return this.prisma.temporaryBoarding.update({
      where: { id },
      data: { status: 'CANCEL' },
    });
  }

  async listToday(routeId: number) {
    const start = new Date();
    start.setHours(0,0,0,0);

    const end = new Date();
    end.setHours(23,59,59,999);

    return this.prisma.temporaryBoarding.findMany({
      where: {
        routeId,
        targetDate: { gte: start, lte: end },
        status: 'ACTIVE',
      },
      orderBy: { targetTime: 'asc' },
    });
  }
}