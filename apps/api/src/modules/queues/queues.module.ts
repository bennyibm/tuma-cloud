import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from '../../schemas/email.schema';
import { EmailEvent, EmailEventSchema } from '../../schemas/email-event.schema';
import { EmailSendProcessor } from './email-send.processor';
import { TransportersModule } from '../transporters/transporters.module';
import { TemplatesModule } from '../templates/templates.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-send-queue',
    }),
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: EmailEvent.name, schema: EmailEventSchema },
    ]),
    TransportersModule,
    TemplatesModule,
    TrackingModule,
  ],
  providers: [EmailSendProcessor],
  exports: [BullModule, EmailSendProcessor],
})
export class QueuesModule {}
