import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  AccountLoginDto,
  AccountRegisterDto,
  RequestResetDto,
  ResetPasswordDto,
  TokenDto,
} from './dto';
import { AccountJwtGuard } from './account-jwt.guard';
import { CurrentAccount, AuthAccount } from './current-account.decorator';

@Controller('account')
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Post('register')
  register(@Body() dto: AccountRegisterDto) {
    return this.account.register(dto);
  }

  @Post('login')
  login(@Body() dto: AccountLoginDto) {
    return this.account.login(dto);
  }

  @Post('verify-email')
  verify(@Body() dto: TokenDto) {
    return this.account.verifyEmail(dto.token);
  }

  @Post('request-reset')
  requestReset(@Body() dto: RequestResetDto) {
    return this.account.requestReset(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.account.resetPassword(dto.token, dto.password);
  }

  @UseGuards(AccountJwtGuard)
  @Get('me')
  me(@CurrentAccount() a: AuthAccount) {
    return this.account.me(a.accountId);
  }

  @UseGuards(AccountJwtGuard)
  @Post('resend-verification')
  resend(@CurrentAccount() a: AuthAccount) {
    return this.account.resendVerification(a.accountId);
  }
}
