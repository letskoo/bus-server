import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { TripModule } from '../trip/trip.module';
import { DriverStartController } from './driver.start.controller';
import { DriverAuthController } from './auth/driver-auth.controller';
import { DriverAuthService } from './auth/driver-auth.service';
import { DriverAuthGuard } from './auth/driver-auth.guard';

@Module({
  imports: [PrismaModule, NotificationModule, TripModule],
  controllers: [DriverController, DriverStartController, DriverAuthController],
  providers: [DriverService, DriverAuthService, DriverAuthGuard],
  exports: [DriverService],
})
export class DriverModule {}