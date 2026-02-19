import { Injectable } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AlimtalkProvider } from './providers/alimtalk.provider';
import { SmsProvider } from './providers/sms.provider';
import { NOTIFICATION_POINTS } from './notification.constants';
import { NotificationRequest, NotificationResult } from './notification.types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alimtalkProvider: AlimtalkProvider,
    private readonly smsProvider: SmsProvider,
  ) {}

  private buildLogMessage(message: string, routeId: number, stopId: number) {
    return `${message} (route:${routeId}, stop:${stopId})`;
  }

  private async deductPoints(organizationId: number, amount: number, reason: string) {
    const org = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { points: { decrement: amount } },
      select: { points: true },
    });

    await this.prisma.pointTransaction.create({
      data: {
        organizationId,
        amount: -amount,
        balanceAfter: org.points,
        reason,
      },
    });

    return org.points;
  }

  async sendOnce(data: NotificationRequest): Promise<NotificationResult> {
    const logMessage = this.buildLogMessage(data.message, data.routeId, data.stopId);
    const needPoints = NOTIFICATION_POINTS.ALIMTALK;

    // 🔥 중복 차단
    const already = await this.prisma.notificationLog.findFirst({
      where: {
        routeId: data.routeId,
        stopId: data.stopId,
        phone: data.phone,
        type: data.type,
      },
    });

    if (already) {
      return {
        sent: false,
        skipped: true,
        reason: 'DUPLICATE',
        costPoints: 0,
      };
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: data.organizationId },
      select: { points: true },
    });

    if (!org || org.points < needPoints) {
      return {
        sent: false,
        skipped: true,
        reason: 'NO_POINTS',
        costPoints: 0,
      };
    }

    let channel: 'ALIMTALK' | 'SMS' = 'ALIMTALK';

    try {
      await this.alimtalkProvider.send(data.phone, data.message);
    } catch {
      try {
        await this.smsProvider.send(data.phone, data.message);
        channel = 'SMS';
      } catch {
        return {
          sent: false,
          skipped: true,
          reason: 'PROVIDER_FAIL',
          costPoints: 0,
        };
      }
    }

    await this.deductPoints(
      data.organizationId,
      needPoints,
      NotificationType[data.type],
    );

    await this.prisma.notificationLog.create({
      data: {
        organizationId: data.organizationId,
        routeId: data.routeId,
        stopId: data.stopId,
        phone: data.phone,
        message: logMessage,
        type: data.type,
        channel: channel as NotificationChannel,
        costPoints: needPoints,
      },
    });

    return {
      sent: true,
      skipped: false,
      channel,
      costPoints: needPoints,
    };
  }
}
