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

const DEV_FAKE_SEND = true; // 테스트모드
const ADMIN_PHONE = '01034081864'; // 관리자 번호
const BASE_URL = 'https://bus-server-production.up.railway.app'; // 🔥 전국용 서버

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

  private async sendLowPointWarning(orgId: number, current: number) {
    if (current > 1000) return;

    const exist = await this.prisma.notificationLog.findFirst({
      where: {
        organizationId: orgId,
        type: 'LOW_POINT' as any,
      },
    });

    if (exist) return;

    console.log('⚠️ 포인트 1000 이하 경고:', current);

    await this.prisma.notificationLog.create({
      data: {
        organizationId: orgId,
        routeId: 0,
        stopId: 0,
        phone: 'ADMIN',
        message: `포인트 부족 경고 (${current})`,
        type: 'LOW_POINT' as any,
        channel: 'ALIMTALK',
        costPoints: 0,
      },
    });
  }

  async sendOnce(data: NotificationRequest): Promise<NotificationResult> {
    const logMessage = this.buildLogMessage(data.message, data.routeId, data.stopId);
    const needPoints = NOTIFICATION_POINTS.ALIMTALK;

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

    if (!org || org.points <= 0) {
      console.log('⛔ 포인트 0 → 발송차단');
      return {
        sent: false,
        skipped: true,
        reason: 'NO_POINTS_BLOCK',
        costPoints: 0,
      };
    }

    await this.sendLowPointWarning(data.organizationId, org.points);

    let channel: 'ALIMTALK' | 'SMS' = 'ALIMTALK';

    if (DEV_FAKE_SEND) {
      console.log('==============================');
      console.log('📢 가짜 발송 (DEV MODE)');
      console.log('to:', data.phone);
      console.log('msg:', data.message);
      console.log('==============================');

      await this.prisma.notificationLog.create({
        data: {
          organizationId: data.organizationId,
          routeId: data.routeId,
          stopId: data.stopId,
          phone: data.phone,
          message: logMessage,
          type: data.type,
          channel: 'ALIMTALK',
          costPoints: 0,
        },
      });

      return {
        sent: true,
        skipped: false,
        channel: 'ALIMTALK',
        costPoints: 0,
      };
    }

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

    const remain = await this.deductPoints(
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

    await this.sendLowPointWarning(data.organizationId, remain);

    return {
      sent: true,
      skipped: false,
      channel,
      costPoints: needPoints,
    };
  }

  // 🔥 관리자 충전요청 (전국용 링크 적용)
  async sendAdminChargeRequest(payload: {
    organizationName: string;
    amount: number;
    requestId: number;
  }) {
    const link = `${BASE_URL}/points/approve-charge?requestId=${payload.requestId}`;

    const msg = `[충전요청]

${payload.organizationName}
${payload.amount.toLocaleString()}원

승인링크
${link}`;

    console.log('📨 관리자 충전요청 발송');

    try {
      await this.alimtalkProvider.send(ADMIN_PHONE, msg);
    } catch {
      await this.smsProvider.send(ADMIN_PHONE, msg);
    }
  }

  // 🔥 충전 완료 알림
  async sendChargeApproved(payload: {
    organizationName: string;
    amount: number;
  }) {
    const msg = `[충전완료]

${payload.organizationName}
${payload.amount.toLocaleString()}원 충전완료`;

    console.log('💰 원장 충전완료 알림');
    console.log(msg);
  }
}