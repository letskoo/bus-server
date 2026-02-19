import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateOrganizationDto) {
    return this.prisma.organization.create({ data });
  }

  findAll() {
    return this.prisma.organization.findMany();
  }

  findOne(id: number) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateOrganizationDto) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.organization.delete({ where: { id } });
  }
}
