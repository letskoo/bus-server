import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlimtalkProvider } from './providers/alimtalk.provider';
import { SmsProvider } from './providers/sms.provider';
import { NotificationService } from './notification.service';
import { DebugController } from '../debug/debug.controller';

@Module({
  imports: [PrismaModule],
  providers: [AlimtalkProvider, SmsProvider, NotificationService],
  controllers: [DebugController],
  exports: [NotificationService, AlimtalkProvider],
})
export class NotificationModule {}
