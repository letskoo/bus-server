import { Injectable } from '@nestjs/common';
import axios from 'axios';

export type AlimtalkSendResult =
  | { ok: true }
  | { ok: false; reason: 'NO_CONFIG' | 'HTTP_ERROR' | 'NO_KAKAO' };

@Injectable()
export class AlimtalkProvider {
  async send(phone: string, message: string): Promise<AlimtalkSendResult> {
    const userid = process.env.ALIGO_USERID;
    const apikey = process.env.ALIGO_APIKEY;
    const sender = process.env.ALIGO_SENDER;
    const senderkey = process.env.ALIGO_SENDERKEY;

    if (!userid || !apikey || !sender || !senderkey) {
      console.log('❌ 알리고 설정 없음');
      return { ok: false, reason: 'NO_CONFIG' };
    }

    try {
      const res = await axios.post(
        'https://kakaoapi.aligo.in/akv10/alimtalk/send/',
        null,
        {
          params: {
            apikey,
            userid,
            senderkey,
            tpl_code: 'UE_5604',
            sender,
            receiver_1: phone,
            message_1: message,
          },
        },
      );

      console.log('알리고 응답:', res.data);

      if (res.data?.code === '0000') {
        console.log('✅ 알림톡 성공');
        return { ok: true };
      } else {
        console.log('❌ 알림톡 실패:', res.data);
        return { ok: false, reason: 'NO_KAKAO' };
      }
    } catch (e: any) {
      console.log('❌ 알림톡 HTTP 오류', e?.response?.data || e?.message);
      return { ok: false, reason: 'HTTP_ERROR' };
    }
  }
}
