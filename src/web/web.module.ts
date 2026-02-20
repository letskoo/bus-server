import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { ShareModule } from '../share/share.module';

@Module({
  imports: [ShareModule],
  controllers: [WebController],
})
export class WebModule {}
