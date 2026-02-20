import { Injectable } from '@nestjs/common';
import { StopEventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ARRIVE_THRESHOLD_M = 30;

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

    return this.prisma.stop.findFirst({
      where: {
        routeId,
        orderNo: { gt: current.orderNo },
      },
      orderBy: { orderNo: 'asc' },
    });
  }

  async processLocationUpdate(routeId: number, lat: number, lng: number) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        routeId,
        status: 'RUNNING',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!trip) return;

    const nextStop = await this.getNextStop(trip.id, routeId);
    if (!nextStop) return;

    const dist = this.distanceMeters(
      lat,
      lng,
      nextStop.latitude,
      nextStop.longitude,
    );

    if (dist > ARRIVE_THRESHOLD_M) return;

    const exists = await this.prisma.stopEvent.findFirst({
      where: {
        tripId: trip.id,
        stopId: nextStop.id,
        type: StopEventType.ARRIVE,
      },
    });

    if (exists) return;

    await this.prisma.stopEvent.create({
      data: {
        tripId: trip.id,
        stopId: nextStop.id,
        type: StopEventType.ARRIVE,
      },
    });

    await this.prisma.trip.update({
      where: { id: trip.id },
      data: { currentStopId: nextStop.id },
    });
  }

  private distanceMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) {
    const R = 6371000;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(v: number) {
    return (v * Math.PI) / 180;
  }
}
