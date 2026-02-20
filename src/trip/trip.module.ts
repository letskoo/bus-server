import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripAutomationService } from './trip-automation.service';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [TripController],
  providers: [TripService, TripAutomationService],
  exports: [
    TripService,
    TripAutomationService
  ],
})
export class TripModule {}
