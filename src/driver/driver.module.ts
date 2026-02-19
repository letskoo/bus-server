import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [DriverService],
  controllers: [DriverController],
  exports: [DriverService],
})
export class DriverModule {}
