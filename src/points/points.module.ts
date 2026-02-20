import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsService } from './points.service';
import { PointsAdminController } from './points.admin.controller';
import { PointsController } from './points.controller';
import { ChargeRequestService } from './charge-request.service';
import { ChargeRequestController } from './charge-request.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [PointsService, ChargeRequestService],
  controllers: [
    PointsAdminController,
    PointsController,
    ChargeRequestController,
  ],
  exports: [PointsService, ChargeRequestService],
})
export class PointsModule {}