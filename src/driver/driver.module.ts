import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { DriverStartController } from './driver.start.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { TripModule } from '../trip/trip.module';
import { DriverAuthModule } from './auth/driver-auth.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    TripModule,
    DriverAuthModule
  ],
  controllers: [
    DriverController,
    DriverStartController
  ],
  providers: [DriverService],
  exports: [DriverService],
})
export class DriverModule {}