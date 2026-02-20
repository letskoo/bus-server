import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PointsService } from './points.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ChargeRequestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService,
    private readonly notificationService: NotificationService,
  ) {}

  async requestCharge(
    organizationId: number,
    amount: number,
    depositor: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new Error('organization not found');

    const req = await this.prisma.chargeRequest.create({
      data: {
        organizationId,
        amount,
        depositor,
        status: 'PENDING',
      },
    });

    // 👉 관리자(너)에게 알림
    await this.notificationService.sendAdminChargeRequest({
      organizationName: org.name,
      amount,
      requestId: req.id,
    });

    return req;
  }

  async approve(requestId: number) {
    const req = await this.prisma.chargeRequest.findUnique({
      where: { id: requestId },
      include: { organization: true },
    });

    if (!req) throw new Error('request not found');
    if (req.status === 'APPROVED') return req;

    // 포인트 지급
    await this.pointsService.adjust(
      req.organizationId,
      req.amount,
      'CHARGE_APPROVED',
    );

    await this.prisma.chargeRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    // 원장에게 충전완료 알림
    await this.notificationService.sendChargeApproved({
      organizationName: req.organization.name,
      amount: req.amount,
    });

    return { success: true };
  }
}