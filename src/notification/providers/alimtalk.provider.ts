import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

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
      const formData = qs.stringify({
        apikey,
        userid,
        senderkey,
        tpl_code: 'UF_5842',
        sender,
        receiver_1: phone,
        message_1: message,
      });

      const res = await axios.post(
        'https://kakaoapi.aligo.in/akv10/alimtalk/send/',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log('알리고 응답:', res.data);

      // 🔥 알리고 성공코드 (0 또는 0000 둘 다 성공)
      if (res.data?.code === 0 || res.data?.code === '0000') {
        console.log('✅ 알림톡 성공');
        return { ok: true };
      }

      console.log('❌ 알림톡 실패:', res.data);
      return { ok: false, reason: 'NO_KAKAO' };

    } catch (e: any) {
      console.log('❌ 알림톡 HTTP 오류', e?.response?.data || e?.message);
      return { ok: false, reason: 'HTTP_ERROR' };
    }
  }
}