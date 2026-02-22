import { Module } from '@nestjs/common';
import { DriverAuthController } from './driver-auth.controller';
import { DriverAuthService } from './driver-auth.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DriverAuthController],
  providers: [DriverAuthService],
  exports: [DriverAuthService],
})
export class DriverAuthModule {}