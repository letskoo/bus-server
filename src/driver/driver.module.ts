import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { DriverStartController } from './driver.start.controller';

import { DriverAuthController } from './auth/driver-auth.controller';
import { DriverAuthService } from './auth/driver-auth.service';
import { DriverAuthGuard } from './auth/driver-auth.guard';

import { NotificationModule } from '../notification/notification.module';
import { TripModule } from '../trip/trip.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    TripModule,
  ],
  controllers: [
    DriverController,
    DriverStartController,
    DriverAuthController,   // 🔥 이거 반드시 있어야 함
  ],
  providers: [
    DriverService,
    DriverAuthService,
    DriverAuthGuard,        // 🔥 이것도
  ],
  exports: [DriverService],
})
export class DriverModule {}