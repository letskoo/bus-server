import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { DriverConsentStatus, TripStatus, TripType } from '@prisma/client';
import { TripService } from '../../trip/trip.service';

@Injectable()
export class DriverAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tripService: TripService,
  ) {}

  private newToken() {
    return randomBytes(24).toString('base64url');
  }

  async loginByQr(consentToken: string) {
    const token = String(consentToken || '').trim();
    if (!token) throw new BadRequestException('token required');

    const consent = await this.prisma.driverConsent.findUnique({
      where: { token },
      include: {
        driver: true,
        organization: { select: { id: true, name: true } },
      },
    });

    if (!consent) throw new NotFoundException('consent token not found');
    if (consent.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('consent token expired');
    if (consent.status === DriverConsentStatus.REVOKED) throw new UnauthorizedException('consent revoked');

    if (consent.status !== DriverConsentStatus.ACCEPTED) {
      await this.prisma.driverConsent.update({
        where: { token },
        data: { status: DriverConsentStatus.ACCEPTED, consentedAt: new Date() },
      });
      await this.prisma.driver.update({
        where: { id: consent.driverId },
        data: { status: 'ACTIVE' as any, isActive: true },
      });
    }

    const sessionToken = this.newToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30d

    await this.prisma.driverSession.create({
      data: {
        token: sessionToken,
        driverId: consent.driverId,
        expiresAt,
      },
    });

    const routes = await this.prisma.route.findMany({
      where: { driverId: consent.driverId, organizationId: consent.organizationId },
      select: { id: true, name: true, organizationId: true, busId: true, driverId: true },
      orderBy: { id: 'asc' },
    });

    return {
      ok: true,
      token: sessionToken,
      driver: { id: consent.driver.id, name: consent.driver.name, phone: consent.driver.phone, organizationId: consent.driver.organizationId },
      organization: consent.organization,
      routes,
    };
  }

  async getMyRoutes(driverId: number) {
    const routes = await this.prisma.route.findMany({
      where: { driverId },
      select: {
        id: true,
        name: true,
        organizationId: true,
        busId: true,
        schedules: {
          where: { enabled: true },
          select: { id: true, type: true, startTime: true, enabled: true },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    });
    return { ok: true, routes };
  }

  private parseHHmm(s: string) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
  }

  async startAuto(driverId: number) {
    const routes = await this.prisma.route.findMany({
      where: { driverId },
      select: {
        id: true,
        schedules: { where: { enabled: true }, select: { type: true, startTime: true } },
      },
    });

    if (!routes.length) throw new BadRequestException('no routes assigned');

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    let best: { routeId: number; type: TripType; diff: number } | null = null;

    for (const r of routes) {
      for (const sch of r.schedules || []) {
        const t = this.parseHHmm(sch.startTime);
        if (t === null) continue;

        const diff = Math.abs(t - nowMin);
        const tripType = sch.type === 'PICKUP' ? TripType.PICKUP : TripType.DROPOFF;

        if (!best || diff < best.diff) {
          best = { routeId: r.id, type: tripType, diff };
        }
      }
    }

    if (!best) {
      // 스케줄이 없으면: 첫 route + PICKUP
      best = { routeId: routes[0].id, type: TripType.PICKUP, diff: 9999 };
    }

    // 이미 동일 route에 RUNNING 있으면 그대로 반환
    const exists = await this.prisma.trip.findFirst({
      where: { routeId: best.routeId, status: TripStatus.RUNNING, type: best.type },
      orderBy: { startedAt: 'desc' },
      select: { id: true, routeId: true, type: true, status: true, startedAt: true },
    });
    if (exists) return { ok: true, trip: exists, started: false };

    const trip = await this.tripService.start(best.routeId, best.type);

    return { ok: true, trip, started: true };
  }
}