import { Injectable } from '@nestjs/common';
import { StopEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripAutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeTrip(tripId: number, routeId: number) {
    const firstStop = await this.prisma.stop.findFirst({
      where: { routeId },
      orderBy: { orderNo: 'asc' },
    });

    if (!firstStop) return null;

    return this.prisma.trip.update({
      where: { id: tripId },
      data: { currentStopId: firstStop.id },
    });
  }

  async getNextStop(tripId: number, routeId: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { currentStopId: true },
    });

    if (!trip) return null;

    // 🔥 아직 아무 정류장도 안찍힌 경우 → 첫 정류장
    if (!trip.currentStopId) {
      return this.prisma.stop.findFirst({
        where: { routeId },
        orderBy: { orderNo: 'asc' },
      });
    }

    const current = await this.prisma.stop.findUnique({
      where: { id: trip.currentStopId },
      select: { orderNo: true },
    });

    if (!current) return null;

    // 🔥 현재 정류장 다음 정류장
    const next = await this.prisma.stop.findFirst({
      where: {
        routeId,
        orderNo: { gt: current.orderNo },
      },
      orderBy: { orderNo: 'asc' },
    });

    return next;
  }
}
