import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TripModule } from '../../trip/trip.module';   // 🔥 추가

import { DriverAuthController } from './driver-auth.controller';
import { DriverAuthService } from './driver-auth.service';
import { DriverAuthGuard } from './driver-auth.guard';

@Module({
  imports: [
    PrismaModule,
    TripModule,   // 🔥 이거 반드시 있어야 함
  ],
  controllers: [DriverAuthController],
  providers: [DriverAuthService, DriverAuthGuard],
  exports: [DriverAuthService, DriverAuthGuard],
})
export class DriverAuthModule {}