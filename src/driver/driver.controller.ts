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

  // ✅ 기사 동의
  @Post('consent/accept')
  accept(@Body() body: { token: string }) {
    return this.driverService.acceptConsent(body?.token);
  }

  // ✅ 기사 철회
  @Post('consent/revoke')
  revoke(@Body() body: { token: string }) {
    return this.driverService.revokeConsent(body?.token);
  }
}
