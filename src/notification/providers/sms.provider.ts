import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsProvider {
  async send(phone: string, message: string): Promise<boolean> {
    console.log('[SMS TEST]', phone, message);
    return true;
  }
}
