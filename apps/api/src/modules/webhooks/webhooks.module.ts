import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Webhook, WebhookSchema } from '../../schemas/webhook.schema';
import { WebhookDelivery, WebhookDeliverySchema } from '../../schemas/webhook-delivery.schema';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDispatchProcessor } from './webhook-dispatch.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhook-dispatch-queue',
    }),
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: WebhookDelivery.name, schema: WebhookDeliverySchema },
    ]),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookDispatchProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
