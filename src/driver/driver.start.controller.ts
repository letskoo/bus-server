import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { TripService } from '../trip/trip.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Controller('driver')
export class DriverStartController {
  constructor(
    private readonly tripService: TripService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('start')
  async start(@Body() body: { routeId: number }) {
    const routeId = Number(body.routeId);
    if (!routeId) throw new BadRequestException('routeId required');

    const trip = await this.tripService.start(routeId, 'GO');

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { stops: true },
    });

    if (!route) throw new BadRequestException('route not found');

    const token = Math.random().toString(36).slice(2);

    await this.prisma.shareToken.create({
      data: {
        token,
        organizationId: route.organizationId,
        routeId,
        driverId: route.driverId ?? null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 5),
      },
    });

    const students = await this.prisma.student.findMany({
      where: {
        stop: { routeId }
      },
      select: { parentPhone: true }
    });

    for (const s of students) {
      if (!s.parentPhone) continue;

      await this.notificationService.sendOnce({
        organizationId: route.organizationId,
        routeId,
        stopId: 0,
        phone: s.parentPhone,
        message: `[학원차량] 실시간 위치 확인\nhttp://localhost:3000/share/${token}`,
        type: 'MANUAL' as any,
      });
    }

    return {
      ok: true,
      tripId: trip.id,
      mapUrl: `http://localhost:3000/share/${token}`,
    };
  }

  @Post('stop')
  async stop(@Body() body: { tripId: number }) {
    const tripId = Number(body.tripId);
    if (!tripId) throw new BadRequestException('tripId required');

    await this.tripService.end(tripId);
    return { ok: true };
  }
}
