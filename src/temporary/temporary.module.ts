import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemporaryQueryController } from './temporary.controller';
import { TemporaryService } from './temporary.service';

@Module({
  controllers: [TemporaryQueryController],
  providers: [TemporaryService, PrismaService],
})
export class TemporaryModule {}