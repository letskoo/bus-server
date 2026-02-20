import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardingLogDto } from './dto/create-boarding-log.dto';

@Injectable()
export class BoardingService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBoardingLogDto) {
    return this.prisma.boardingLog.create({ data });
  }

  // 🔥 기사 앱용 노선 리스트 (임시탑승 포함)
  async getTodayBoardingList(routeId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 🔵 일반 학생 (임시 생성된 학생 제외)
    const students = await this.prisma.student.findMany({
      where: {
        stop: {
          routeId,
        },
        name: {
          not: {
            contains: '(임시)',
          },
        },
      },
      include: {
        stop: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // 🔴 임시 학생 (오늘)
    const temporary = await this.prisma.temporaryBoarding.findMany({
      where: {
        routeId,
        status: 'ACTIVE',
        targetDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        stop: true,
      },
      orderBy: {
        targetTime: 'asc',
      },
    });

    const result: any[] = [];

    // 일반 학생
    for (const s of students) {
      result.push({
        type: 'STUDENT',
        studentId: s.id,
        name: s.name,
        phoneLast4: s.parentPhone?.slice(-4) ?? '',
        stopId: s.stopId,
        stopName: s.stop?.name ?? '',
      });
    }

    // 임시 학생
    for (const t of temporary) {
      result.push({
        type: 'TEMP',
        tempId: t.id,
        name: t.studentName,
        phoneLast4: t.studentPhoneLast4 ?? '',
        stopId: t.stopId,
        stopName: t.stop?.name ?? '',
      });
    }

    return result;
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