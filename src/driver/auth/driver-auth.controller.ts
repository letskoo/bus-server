import { Body, Controller, Get, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { DriverAuthService } from './driver-auth.service';
import { DriverAuthGuard } from './driver-auth.guard';

@Controller('driver')
export class DriverAuthController {
  constructor(private readonly driverAuthService: DriverAuthService) {}

  @Post('auth/qr')
  loginByQr(@Body() body: { token: string }) {
    return this.driverAuthService.loginByQr(body?.token);
  }

  @UseGuards(DriverAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return { ok: true, driver: req.driver };
  }

  @UseGuards(DriverAuthGuard)
  @Get('my-routes')
  myRoutes(@Req() req: any) {
    return this.driverAuthService.getMyRoutes(req.driver.id);
  }

  @UseGuards(DriverAuthGuard)
  @Post('start-auto')
  startAuto(@Req() req: any) {
    return this.driverAuthService.startAuto(req.driver.id);
  }

  @UseGuards(DriverAuthGuard)
  @Post('stop')
  stop(@Body() body: { tripId: number }, @Req() req: any) {
    const tripId = Number(body?.tripId);
    if (!tripId) throw new BadRequestException('tripId required');
    // 기존 TripService.end는 controller에 이미 있으니 그대로 사용하도록 TripController에서 처리
    // 여기서는 stop 라우팅만 유지 (앱 편의)
    return { ok: true, tripId };
  }
}