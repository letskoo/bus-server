import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BoardingMode,
  BoardingStatus,
  DriverConsentStatus,
  DriverStatus,
  NotificationType,
  StopEventType,
  TripStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private static autoConfirmTimers = new Map<string, NodeJS.Timeout>();

  private newToken() {
    return randomBytes(18).toString('base64url');
  }

  private last4(phone: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.slice(-4).padStart(4, '*');
  }

  async acceptConsent(token: string) {
    if (!token) throw new BadRequestException('token required');

    const row = await this.prisma.driverConsent.findUnique({
      where: { token },
    });
    if (!row) throw new NotFoundException('consent token not found');

    await this.prisma.$transaction([
      this.prisma.driverConsent.update({
        where: { token },
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

    const row = await this.prisma.driverConsent.findUnique({
      where: { token },
      include: { driver: true, organization: true },
    });
    if (!row) throw new NotFoundException('consent token not found');

    await this.prisma.$transaction([
      this.prisma.driverConsent.update({
        where: { token },
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
        message: `${this.last4(row.driver.phone)} 기사 위치공유 해제`,
        type: NotificationType.MANUAL,
      });
    }

    return { ok: true };
  }

  private distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async getNextStopForTrip(tripId: number, routeId: number) {
    const arrived = await this.prisma.stopEvent.findMany({
      where: { tripId, type: StopEventType.ARRIVE },
      select: { stopId: true },
    });

    const arrivedStopIds = arrived.map((a) => a.stopId);

    return this.prisma.stop.findFirst({
      where: {
        routeId,
        ...(arrivedStopIds.length > 0 ? { id: { notIn: arrivedStopIds } } : {}),
      },
      orderBy: { orderNo: 'asc' },
    });
  }

  private scheduleAutoConfirm(tripId: number, routeId: number, stopId: number) {
    const key = `${tripId}:${stopId}`;
    if (DriverService.autoConfirmTimers.has(key)) return;

    const t = setTimeout(async () => {
      DriverService.autoConfirmTimers.delete(key);
      await this.autoConfirmBoarding(tripId, routeId, stopId);
    }, 45_000);

    DriverService.autoConfirmTimers.set(key, t);
  }

  private async autoConfirmBoarding(tripId: number, routeId: number, stopId: number) {
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
  }

  async upsertLocation(data: UpdateLocationDto) {
    const routeId = Number(data.routeId);
    const lat = Number(data.lat);
    const lng = Number(data.lng);

    if (!routeId || isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('routeId, lat, lng required');
    }

    const trip = await this.prisma.trip.findFirst({
      where: { routeId, status: TripStatus.RUNNING },
      orderBy: { startedAt: 'desc' },
      select: { id: true, organizationId: true },
    });

    if (!trip) return { skipped: true };

    const location = await this.prisma.driverLocation.upsert({
      where: { routeId },
      update: { latitude: lat, longitude: lng },
      create: { routeId, latitude: lat, longitude: lng },
    });

    const nextStop = await this.getNextStopForTrip(trip.id, routeId);
    if (!nextStop) return location;

    const dist = this.distanceMeters(lat, lng, nextStop.latitude, nextStop.longitude);

    if (dist <= 80) {
      const exists = await this.prisma.stopEvent.findFirst({
        where: { tripId: trip.id, stopId: nextStop.id, type: StopEventType.ARRIVE },
      });

      if (!exists) {
        await this.prisma.stopEvent.create({
          data: { tripId: trip.id, stopId: nextStop.id, type: StopEventType.ARRIVE },
        });

        await this.prisma.trip.update({
          where: { id: trip.id },
          data: { currentStopId: nextStop.id },
        });

        const students = await this.prisma.student.findMany({
          where: { stopId: nextStop.id },
          select: { parentPhone: true },
        });

        for (const s of students) {
          if (!s.parentPhone) continue;

          await this.notificationService.sendOnce({
            organizationId: trip.organizationId,
            routeId,
            stopId: nextStop.id,
            phone: s.parentPhone,
            message: `버스가 정류장에 도착했습니다`,
            type: NotificationType.ARRIVED,
          });
        }

        this.scheduleAutoConfirm(trip.id, routeId, nextStop.id);
      }
    }

    return location;
  }

  async findLocation(routeId: number) {
    return this.prisma.driverLocation.findUnique({ where: { routeId } });
  }

  async getLocation(routeId: number) {
    return this.prisma.driverLocation.findUnique({
      where: { routeId },
    });
  }
}
