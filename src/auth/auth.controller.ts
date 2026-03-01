import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    return;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Req() req: Request) {
    const user: any = req.user;

    return {
      message: '카카오 로그인 성공',
      kakaoId: user.id,
      nickname: user.username,
    };
  }
}