import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: 'b4b731bc491c78a2a4834e026482fdee',

      // 🔥 여기 중요
      callbackURL:
        'http://localhost:3000/auth/kakao/callback',

      // 🔥 이거 추가 안하면 KOE006 뜨는 경우 많음
      scope: ['profile_nickname', 'profile_image', 'account_email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const user = {
      kakaoId: profile.id,
      nickname: profile.username,
      profileImage: profile._json?.properties?.profile_image,
      email: profile._json?.kakao_account?.email,
      accessToken,
    };

    done(null, user);
  }
}