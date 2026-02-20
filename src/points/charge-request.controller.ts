import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChargeRequestService } from './charge-request.service';

@Controller('points')
export class ChargeRequestController {
  constructor(private readonly service: ChargeRequestService) {}

  // 원장 충전요청
  @Post('request-charge')
  request(
    @Body()
    body: {
      organizationId: number;
      amount: number;
      depositor: string;
    },
  ) {
    return this.service.requestCharge(
      Number(body.organizationId),
      Number(body.amount),
      body.depositor,
    );
  }

  // 관리자 승인 (카톡 버튼용 GET)
  @Get('approve-charge')
  approveGet(@Query('requestId') requestId: string) {
    return this.service.approve(Number(requestId));
  }

  // 관리자 승인 (테스트 POST)
  @Post('approve-charge')
  approve(@Body() body: { requestId: number }) {
    return this.service.approve(Number(body.requestId));
  }
}