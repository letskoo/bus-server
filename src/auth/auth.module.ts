import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KakaoStrategy } from './kakao.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [KakaoStrategy],
})
export class AuthModule {}