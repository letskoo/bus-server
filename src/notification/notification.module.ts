import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AlimtalkProvider } from './providers/alimtalk.provider';
import { SmsProvider } from './providers/sms.provider';
import { NotificationService } from './notification.service';

@Module({
  imports: [PrismaModule],
  providers: [AlimtalkProvider, SmsProvider, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
