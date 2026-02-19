// src/stop/stop.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { UpdateStopDto } from './dto/update-stop.dto';

@Injectable()
export class StopService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateStopDto) {
    const { name, routeId, orderNo, lat, lng, latitude, longitude } = data as any;

    return this.prisma.stop.create({
      data: {
        name,
        routeId,
        orderNo,
        latitude: lat ?? latitude,
        longitude: lng ?? longitude,
      },
    });
  }

  findAll() {
    return this.prisma.stop.findMany({
      orderBy: { orderNo: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.stop.findUnique({
      where: { id },
    });
  }

  update(id: number, data: UpdateStopDto) {
    const { name, orderNo, lat, lng, latitude, longitude } = data as any;

    return this.prisma.stop.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(orderNo !== undefined && { orderNo }),
        ...((lat !== undefined || latitude !== undefined) && {
          latitude: lat ?? latitude,
        }),
        ...((lng !== undefined || longitude !== undefined) && {
          longitude: lng ?? longitude,
        }),
      },
    });
  }

  remove(id: number) {
    return this.prisma.stop.delete({
      where: { id },
    });
  }
}
