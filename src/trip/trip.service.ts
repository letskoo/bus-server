import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverStatus, NotificationType, TripStatus, TripType } from '@prisma/client';
import { TripAutomationService } from './trip-automation.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripAutomationService: TripAutomationService,
    private readonly notificationService: NotificationService,
  ) {}

  private mapType(input: string): TripType {
    const v = String(input || '').toUpperCase();

    if (v === 'GO') return TripType.PICKUP;
    if (v === 'RETURN') return TripType.DROPOFF;

    if (v === 'PICKUP') return TripType.PICKUP;
    if (v === 'DROPOFF') return TripType.DROPOFF;

    throw new BadRequestException('type must be one of: GO, RETURN, PICKUP, DROPOFF');
  }

  private last4(phone: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.slice(-4).padStart(4, '*');
  }

  async start(routeId: number, type: string) {
    if (!routeId) throw new BadRequestException('routeId is required');

    const tripType = this.mapType(type);

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: { organizationId: true, driverId: true },
    });

    if (!route?.organizationId) {
      throw new BadRequestException('invalid routeId (cannot resolve organizationId)');
    }

    if (!route.driverId) {
      throw new BadRequestException('no driver assigned to this route');
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: route.driverId },
      select: { status: true },
    });

    if (!driver || driver.status !== DriverStatus.ACTIVE) {
      throw new BadRequestException('driver not consented/active');
    }

    const exists = await this.prisma.trip.findFirst({
      where: { routeId, type: tripType, status: TripStatus.RUNNING },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('Trip already running for this route and type');
    }

    const trip = await this.prisma.trip.create({
      data: {
        organizationId: route.organizationId,
        routeId,
        type: tripType,
        status: TripStatus.RUNNING,
      },
    });

    await this.tripAutomationService.initializeTrip(trip.id, routeId);

    return trip;
  }

  async end(tripId: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, status: true, routeId: true, organizationId: true },
    });
    if (!trip) throw new BadRequestException('trip not found');

    if (trip.status === TripStatus.ENDED) return trip;

    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.ENDED, endedAt: new Date() },
    });

    const route = await this.prisma.route.findUnique({
      where: { id: trip.routeId },
      select: {
        driverId: true,
        organization: { select: { ownerPhone: true } },
        driver: { select: { phone: true } },
      },
    });

    const ownerPhone = route?.organization?.ownerPhone ?? null;
    const driverPhone = route?.driver?.phone ?? null;

    if (ownerPhone && driverPhone) {
      await this.notificationService.sendOnce({
        organizationId: trip.organizationId,
        routeId: trip.routeId,
        stopId: 0,
        phone: ownerPhone,
        message: `${this.last4(driverPhone)}번 기사의 위치공유가 해제되었습니다`,
        type: NotificationType.DRIVER_SHARE_DISABLED,
      });
    }

    return updated;
  }

  async getActive(routeId: number, type?: string) {
    if (!routeId) throw new BadRequestException('routeId is required');

    const where: any = { routeId, status: TripStatus.RUNNING };
    if (type) where.type = this.mapType(type);

    return this.prisma.trip.findFirst({ where });
  }
}
