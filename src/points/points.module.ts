import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsService } from './points.service';
import { PointsAdminController } from './points.admin.controller';
import { PointsController } from './points.controller';

@Module({
  imports: [PrismaModule],
  providers: [PointsService],
  controllers: [PointsAdminController, PointsController],
  exports: [PointsService],
})
export class PointsModule {}
