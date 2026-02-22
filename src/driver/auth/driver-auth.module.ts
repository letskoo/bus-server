import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DriverAuthController } from './driver-auth.controller';
import { DriverAuthService } from './driver-auth.service';
import { DriverAuthGuard } from './driver-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [DriverAuthController],
  providers: [DriverAuthService, DriverAuthGuard],
  exports: [DriverAuthService, DriverAuthGuard],
})
export class DriverAuthModule {}