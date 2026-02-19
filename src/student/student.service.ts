import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ShareService } from '../share/share.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shareService: ShareService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(data: CreateStudentDto) {
    const { name, parentPhone, stopId } = data;

    if (!name || !parentPhone || !stopId) {
      throw new BadRequestException('name, parentPhone, stopId required');
    }

    const stop = await this.prisma.stop.findUnique({
      where: { id: stopId },
      include: {
        route: {
          select: {
            id: true,
            organizationId: true,
          },
        },
      },
    });

    if (!stop?.route) {
      throw new BadRequestException('route not found for stop');
    }

    const organizationId = stop.route.organizationId;
    const routeId = stop.route.id;

    const student = await this.prisma.student.create({
      data: {
        name,
        parentPhone,
        stop: { connect: { id: stopId } },
        organization: { connect: { id: organizationId } },
      },
    });

    // 🔥 학부모 실시간 위치 링크 생성
    const tokenRow = await this.shareService.createToken(routeId);

    const link = `http://localhost:3000/share/${tokenRow.token}`;

    await this.notificationService.sendOnce({
      organizationId,
      routeId,
      stopId,
      phone: parentPhone,
      message: `[학원차량] 실시간 위치 확인 ${link}`,
      type: NotificationType.MANUAL,
    });

    return student;
  }

  findAll(_params?: any) {
    return this.prisma.student.findMany();
  }

  findOne(id: number) {
    return this.prisma.student.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    return this.prisma.student.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.student.delete({ where: { id } });
  }
}
