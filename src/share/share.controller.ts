import { Body, Controller, Get, Param, Post, NotFoundException } from '@nestjs/common';
import { ShareService } from './share.service';

@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  // 🔥 토큰 생성
  @Post('token')
  create(@Body() body: { routeId: number; ttlMinutes?: number }) {
    return this.shareService.createToken(
      Number(body.routeId),
      body?.ttlMinutes ? Number(body.ttlMinutes) : undefined,
    );
  }

  // 🔥 토큰 조회 (학부모 링크)
  @Get(':token')
  async get(@Param('token') token: string) {
    if (!token) throw new NotFoundException('invalid token');
    return this.shareService.getShareByToken(token);
  }
}
