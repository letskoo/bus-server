import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BoardingMode,
  BoardingStatus,
  DriverConsentStatus,
  DriverStatus,
  NotificationType,
  StopEventType,
  TripStatus,
  TripType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { TripAutomationService } from '../trip/trip-automation.service';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly tripAutomationService: TripAutomationService,
  ) {}

  private static autoConfirmTimers = new Map<string, NodeJS.Timeout>();

  private last4(phone: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.slice(-4).padStart(4, '*');
  }

  // ===================== 동의 =====================

  async acceptConsent(token: string) {
    if (!token) throw new BadRequestException('token required');

    const row = await this.prisma.driverConsent.findFirst({
      where: { token: String(token).trim() },
    });

    if (!row) throw new NotFoundException('consent token not found');

    await this.prisma.$transaction([
      this.prisma.driverConsent.update({
        where: { token: row.token },
        data: { status: DriverConsentStatus.ACCEPTED, consentedAt: new Date() },
      }),
      this.prisma.driver.update({
        where: { id: row.driverId },
        data: { status: DriverStatus.ACTIVE },
      }),
    ]);

    return { ok: true };
  }

  async revokeConsent(token: string) {
    if (!token) throw new BadRequestException('token required');

    const row = await this.prisma.driverConsent.findFirst({
      where: { token: String(token).trim() },
      include: { driver: true, organization: true },
    });

    if (!row) throw new NotFoundException('consent token not found');

    await this.prisma.$transaction([
      this.prisma.driverConsent.update({
        where: { token: row.token },
        data: { status: DriverConsentStatus.REVOKED },
      }),
      this.prisma.driver.update({
        where: { id: row.driverId },
        data: { status: DriverStatus.REVOKED },
      }),
    ]);

    if (row.organization.ownerPhone) {
      await this.notificationService.sendOnce({
        organizationId: row.organizationId,
        routeId: 0,
        stopId: 0,
        phone: row.organization.ownerPhone,
        message: `${this.last4(row.driver.phone)} 기사의 위치공유 해제`,
        type: NotificationType.MANUAL,
      });
    }

    return { ok: true };
  }

  // ===================== 운행 시작 =====================

  async startTrip(routeId: number) {
    routeId = Number(routeId);
    if (!routeId) throw new BadRequestException('routeId required');

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: { id: true, organizationId: true },
    });

    if (!route) throw new NotFoundException('route not found');

    const running = await this.prisma.trip.findFirst({
      where: { routeId, status: TripStatus.RUNNING },
      orderBy: { startedAt: 'desc' },
    });

    if (running) {
      return { ok: true, tripId: running.id, already: true };
    }

    const trip = await this.prisma.trip.create({
      data: {
        routeId,
        organizationId: route.organizationId,
        status: TripStatus.RUNNING,
        startedAt: new Date(),
        type: TripType.PICKUP,
      },
    });

    return { ok: true, tripId: trip.id };
  }

  // ===================== 운행 종료 =====================

  async stopTrip(routeId: number) {
    routeId = Number(routeId);
    if (!routeId) throw new BadRequestException('routeId required');

    const running = await this.prisma.trip.findFirst({
      where: { routeId, status: TripStatus.RUNNING },
      orderBy: { startedAt: 'desc' },
    });

    if (!running) return { ok: true, alreadyStopped: true };

    await this.prisma.trip.update({
      where: { id: running.id },
      data: {
        status: TripStatus.ENDED,
        endedAt: new Date(),
      },
    });

    return { ok: true };
  }

  // ===================== 위치 =====================

  async upsertLocation(data: UpdateLocationDto) {
    const routeId = Number(data.routeId);
    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!routeId || isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('routeId, lat, lng required');
    }

    const location = await this.prisma.driverLocation.upsert({
      where: { routeId },
      update: { latitude: lat, longitude: lng },
      create: { routeId, latitude: lat, longitude: lng },
    });

    const trip = await this.prisma.trip.findFirst({
      where: { routeId, status: TripStatus.RUNNING },
      orderBy: { startedAt: 'desc' },
      select: { id: true, organizationId: true },
    });

    if (!trip) return location;

    const before = await this.prisma.stopEvent.count({
      where: { tripId: trip.id, type: StopEventType.ARRIVE },
    });

    await this.tripAutomationService.processLocationUpdate(routeId, lat, lng);

    const after = await this.prisma.stopEvent.count({
      where: { tripId: trip.id, type: StopEventType.ARRIVE },
    });

    if (after === before) return location;

    const lastArrive = await this.prisma.stopEvent.findFirst({
      where: { tripId: trip.id, type: StopEventType.ARRIVE },
      orderBy: { createdAt: 'desc' },
      select: { stopId: true },
    });

    if (!lastArrive) return location;

    const students = await this.prisma.student.findMany({
      where: { stopId: lastArrive.stopId },
      select: { parentPhone: true },
    });

    for (const s of students) {
      if (!s.parentPhone) continue;

      await this.notificationService.sendOnce({
        organizationId: trip.organizationId,
        routeId,
        stopId: lastArrive.stopId,
        phone: s.parentPhone,
        message: `버스가 정류장에 도착했습니다`,
        type: NotificationType.ARRIVED,
      });
    }

    this.scheduleAutoConfirm(trip.id, routeId, lastArrive.stopId);

    return location;
  }

  private scheduleAutoConfirm(tripId: number, routeId: number, stopId: number) {
    const key = `${tripId}:${stopId}`;
    if (DriverService.autoConfirmTimers.has(key)) return;

    const t = setTimeout(async () => {
      DriverService.autoConfirmTimers.delete(key);

      const students = await this.prisma.student.findMany({
        where: { stopId },
        select: { id: true },
      });

      for (const s of students) {
        const exists = await this.prisma.boardingLog.findFirst({
          where: { routeId, stopId, studentId: s.id, tripId },
        });
        if (exists) continue;

        await this.prisma.boardingLog.create({
          data: {
            routeId,
            stopId,
            studentId: s.id,
            tripId,
            status: BoardingStatus.BOARDED,
            mode: BoardingMode.AUTO,
          },
        });
      }
    }, 45_000);

    DriverService.autoConfirmTimers.set(key, t);
  }

  async getLocation(routeId: number) {
    return this.prisma.driverLocation.findUnique({
      where: { routeId },
    });
  }

  async findLocation(routeId: number) {
    return this.prisma.driverLocation.findUnique({
      where: { routeId },
    });
  }
}