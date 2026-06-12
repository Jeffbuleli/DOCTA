import { Global, Module } from '@nestjs/common';
import { MembershipGuard } from './membership.guard';

@Global()
@Module({
  providers: [MembershipGuard],
  exports: [MembershipGuard],
})
export class CommonModule {}
