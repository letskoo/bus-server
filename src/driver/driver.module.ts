import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { NotificationModule } from '../notification/notification.module';
import { TripModule } from '../trip/trip.module';
import { DriverStartController } from './driver.start.controller';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    TripModule
  ],
  providers: [DriverService],
  controllers: [
    DriverController,
    DriverStartController
  ],
  exports: [DriverService],
})
export class DriverModule {}
