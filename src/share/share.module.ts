import { Module } from '@nestjs/common';
import { DriverModule } from '../driver/driver.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TripModule } from '../trip/trip.module';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [PrismaModule, DriverModule, TripModule],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService], // 🔥 추가 (핵심)
})
export class ShareModule {}
