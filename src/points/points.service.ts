import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PointsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async getBalance(organizationId: number) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, points: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async adjust(organizationId: number, amount: number, reason: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, points: true },
    });
    if (!org) throw new NotFoundException('Organization not found');

    const next = org.points + amount;
    if (next < 0) {
      throw new Error('points cannot be negative');
    }

    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { points: next },
      select: { id: true, name: true, points: true },
    });

    await this.prisma.pointTransaction.create({
      data: {
        organizationId,
        amount,
        balanceAfter: updated.points,
        reason,
      },
    });

    // 🔥 충전일 경우 → 원장 충전완료 알림
    if (amount > 0) {
      await this.notificationService.sendChargeApproved({
        organizationName: updated.name,
        amount,
      });
    }

    return updated;
  }

  async history(organizationId: number, take = 50) {
    return this.prisma.pointTransaction.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }
}