import { Body, Controller, Post } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller('admin/points')
export class PointsAdminController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('adjust')
  adjust(
    @Body()
    body: { organizationId: number; amount: number; reason?: string },
  ) {
    return this.pointsService.adjust(
      Number(body.organizationId),
      Number(body.amount),
      body.reason ?? 'MANUAL_ADJUST',
    );
  }
}
