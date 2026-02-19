import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ArrivalDto, ArrivalMode } from './dto/arrival.dto';

@Injectable()
export class ArrivalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create({ routeId, stopId, mode }: ArrivalDto) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { organization: true },
    });

    if (!route) return { count: 0 };

    const stop = await this.prisma.stop.findFirst({ where: { id: stopId, routeId } });
    if (!stop) return { count: 0 };

    let targetStopId: number | null = null;
    let notificationType: NotificationType;
    let message: string;

    if (mode === ArrivalMode.MANUAL) {
      targetStopId = stopId;
      notificationType = NotificationType.MANUAL;
      message = `[${route.organization.name}] 차량이 정류장에 도착했습니다.`;
    } else {
      const targetOrderNo = stop.orderNo + route.alertBeforeCnt;
      const targetStop = await this.prisma.stop.findFirst({
        where: { routeId, orderNo: targetOrderNo },
      });

      if (!targetStop) return { count: 0 };

      targetStopId = targetStop.id;
      notificationType = NotificationType.BEFORE_STOP;
      message = `[${route.organization.name}] 차량이 곧 도착합니다.`;
    }

    const students = await this.prisma.student.findMany({
      where: { stopId: targetStopId },
      select: { parentPhone: true },
    });

    if (students.length === 0) return { count: 0 };

    const results = await Promise.all(
      students.map((student) =>
        this.notificationService.sendOnce({
          organizationId: route.organizationId,
          phone: student.parentPhone,
          message,
          type: notificationType,
          routeId,
          stopId: targetStopId!,
        }),
      ),
    );

    const count = results.filter((r) => !r.skipped).length;
    return { count };
  }
}
