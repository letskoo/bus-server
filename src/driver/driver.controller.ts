import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DriverService } from './driver.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post('location')
  upsertLocation(@Body() dto: UpdateLocationDto) {
    return this.driverService.upsertLocation(dto);
  }

  @Get('location/:routeId')
  getLocation(@Param('routeId') routeId: string) {
    return this.driverService.getLocation(Number(routeId));
  }

  // 기사 동의
  @Post('consent/accept')
  accept(@Body() body: { token: string }) {
    return this.driverService.acceptConsent(body?.token);
  }

  @Post('consent/revoke')
  revoke(@Body() body: { token: string }) {
    return this.driverService.revokeConsent(body?.token);
  }

  // 🔥 운행 시작
  @Post('start')
  start(@Body() body: { routeId: number }) {
    return this.driverService.startTrip(body?.routeId);
  }

  // 🔥 운행 종료
  @Post('stop')
  stop(@Body() body: { routeId: number }) {
    return this.driverService.stopTrip(body?.routeId);
  }
}