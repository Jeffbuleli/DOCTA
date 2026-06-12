import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthAccount {
  accountId: string;
  email: string;
}

export const CurrentAccount = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthAccount =>
    ctx.switchToHttp().getRequest().user,
);
