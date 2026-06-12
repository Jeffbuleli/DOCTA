import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface AccountJwtPayload {
  sub: string;
  email: string;
  typ: 'account';
}

/** Strategie JWT dediee aux comptes patients (distincte du JWT du personnel). */
@Injectable()
export class AccountJwtStrategy extends PassportStrategy(Strategy, 'jwt-account') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-a-changer',
    });
  }

  async validate(payload: AccountJwtPayload) {
    if (payload.typ !== 'account') {
      throw new UnauthorizedException();
    }
    return { accountId: payload.sub, email: payload.email };
  }
}
