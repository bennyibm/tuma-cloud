import { Module } from '@nestjs/common';
import { MailpitTransporter } from './mailpit.transporter';

@Module({
  providers: [MailpitTransporter],
  exports: [MailpitTransporter],
})
export class TransportersModule {}
