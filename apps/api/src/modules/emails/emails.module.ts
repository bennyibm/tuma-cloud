import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from '../../schemas/email.schema';
import { Template, TemplateSchema } from '../../schemas/template.schema';
import { ApiKey, ApiKeySchema } from '../../schemas/api-key.schema';
import { EmailsController } from './emails.controller';
import { ClientEmailsController } from './client-emails.controller';
import { EmailsService } from './emails.service';
import { QueuesModule } from '../queues/queues.module';
import { SuppressionsModule } from '../suppressions/suppressions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: Template.name, schema: TemplateSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
    ]),
    QueuesModule,
    SuppressionsModule,
  ],
  controllers: [EmailsController, ClientEmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
