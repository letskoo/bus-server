import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRouteDto) {
    return this.prisma.route.create({ data });
  }

  findAll(organizationId?: number) {
    if (organizationId !== undefined) {
      return this.prisma.route.findMany({ where: { organizationId } });
    }
    return this.prisma.route.findMany();
  }

  findOne(id: number) {
    return this.prisma.route.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateRouteDto) {
    return this.prisma.route.update({ where: { id }, data });
  }

  async remove(id: number) {
    const [_, route] = await this.prisma.$transaction([
      this.prisma.stop.deleteMany({ where: { routeId: id } }),
      this.prisma.route.delete({ where: { id } }),
    ]);
    return route;
  }
}
