import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { ArrivalController } from './arrival.controller';
import { ArrivalService } from './arrival.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [ArrivalController],
  providers: [ArrivalService],
})
export class ArrivalModule {}
