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

    throw new BadRequestException('type must be GO | RETURN | PICKUP | DROPOFF');
  }

  private last4(phone: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.slice(-4).padStart(4, '*');
  }

  async start(routeId: number, type: string) {
    if (!routeId) throw new BadRequestException('routeId required');

    const tripType = this.mapType(type);

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        driver: true,
        stops: { orderBy: { orderNo: 'asc' }, take: 1 },
      },
    });

    if (!route) throw new BadRequestException('route not found');
    if (!route.organizationId) throw new BadRequestException('organization missing');
    if (!route.driverId) throw new BadRequestException('driver not assigned');

    if (!route.driver || route.driver.status !== DriverStatus.ACTIVE) {
      throw new BadRequestException('driver not active');
    }

    const exists = await this.prisma.trip.findFirst({
      where: {
        routeId,
        type: tripType,
        status: TripStatus.RUNNING,
      },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('Trip already running');
    }

    const firstStop = route.stops?.[0]?.id ?? null;

    const trip = await this.prisma.trip.create({
      data: {
        organizationId: route.organizationId,
        routeId,
        busId: route.busId ?? null,
        type: tripType,
        status: TripStatus.RUNNING,
        currentStopId: firstStop,
      },
    });

    await this.tripAutomationService.initializeTrip(trip.id, routeId);

    return trip;
  }

  async end(tripId: number) {
    if (!tripId) throw new BadRequestException('tripId required');

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
        routeId: true,
        organizationId: true,
      },
    });

    if (!trip) throw new BadRequestException('trip not found');

    if (trip.status === TripStatus.ENDED) return trip;

    const updated = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.ENDED,
        endedAt: new Date(),
      },
    });

    const route = await this.prisma.route.findUnique({
      where: { id: trip.routeId },
      select: {
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
    if (!routeId) throw new BadRequestException('routeId required');

    const where: any = {
      routeId,
      status: TripStatus.RUNNING,
    };

    if (type) where.type = this.mapType(type);

    return this.prisma.trip.findFirst({
      where,
      orderBy: { startedAt: 'desc' },
    });
  }
}
