import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverService } from '../driver/driver.service';
import { SHARE_TOKEN_TTL_MINUTES_DEFAULT } from '../notification/notification.constants';
import { randomBytes } from 'crypto';

@Injectable()
export class ShareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly driverService: DriverService,
  ) {}

  private distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private etaMinutes(distMeters: number) {
    const ARRIVE_RADIUS_M = 80;
    if (distMeters <= ARRIVE_RADIUS_M) return 0;

    const SPEED_KMH = 30;
    const speedMps = (SPEED_KMH * 1000) / 3600;
    const etaSeconds = distMeters / speedMps;

    return Math.max(1, Math.ceil(etaSeconds / 60));
  }

  private newToken() {
    return randomBytes(18).toString('base64url');
  }

  async createToken(routeId: number, ttlMinutes?: number, driverId?: number) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: { id: true, organizationId: true, driverId: true },
    });
    if (!route) throw new NotFoundException('Route not found');

    const ttl = Math.max(
      1,
      Math.min(120, ttlMinutes ?? SHARE_TOKEN_TTL_MINUTES_DEFAULT),
    );
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    const token = this.newToken();
    const resolvedDriverId = driverId ?? route.driverId ?? null;

    await this.prisma.shareToken.create({
      data: {
        token,
        organizationId: route.organizationId,
        routeId: route.id,
        driverId: resolvedDriverId,
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  async getShareByToken(token: string) {
    const row = await this.prisma.shareToken.findUnique({
      where: { token },
      select: { routeId: true, expiresAt: true },
    });

    if (!row) throw new NotFoundException('Share token not found');

    if (row.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Share token expired');
    }

    return this.getShareData(row.routeId);
  }

  async getShareData(routeId: number) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        stops: {
          orderBy: { orderNo: 'asc' },
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            orderNo: true,
          },
        },
      },
    });

    if (!route) throw new NotFoundException('Route not found');

    const trip = await this.prisma.trip.findFirst({
      where: { routeId, status: 'RUNNING' as any },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        status: true,
        type: true,
        startedAt: true,
        currentStopId: true,
      },
    });

    if (!trip) throw new NotFoundException('Running trip not found');

    const location = await this.driverService.findLocation(routeId);

    // 🔥 핵심: 현재 정류장 이후 다음 정류장 계산
    let nextStop = null;

    if (trip.currentStopId) {
      const current = await this.prisma.stop.findUnique({
        where: { id: trip.currentStopId },
        select: { orderNo: true },
      });

      if (current) {
        nextStop = await this.prisma.stop.findFirst({
          where: {
            routeId,
            orderNo: { gt: current.orderNo },
          },
          orderBy: { orderNo: 'asc' },
        });
      }
    }

    if (!nextStop) {
      nextStop = await this.prisma.stop.findFirst({
        where: { routeId },
        orderBy: { orderNo: 'asc' },
      });
    }

    let etaMin = 0;

    if (location && nextStop) {
      const dist = this.distanceMeters(
        location.latitude,
        location.longitude,
        nextStop.latitude,
        nextStop.longitude,
      );
      etaMin = this.etaMinutes(dist);
    }

    return {
      route: {
        id: route.id,
        name: route.name,
        organizationId: route.organizationId,
        stops: route.stops,
      },
      trip,
      location,
      nextStop,
      etaMin,
    };
  }
}
