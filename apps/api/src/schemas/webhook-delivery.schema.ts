import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type WebhookDeliveryDocument = HydratedDocument<WebhookDelivery>;

@Schema({ timestamps: true, collection: 'webhook_deliveries' })
export class WebhookDelivery extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Webhook', required: true, index: true })
  webhookId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true, enum: ['success', 'failed', 'retrying'], default: 'success' })
  status: string;

  @Prop({ default: null })
  httpStatusCode: number;

  @Prop({ default: null })
  responseBody: string;

  @Prop({ default: 0 })
  latencyMs: number;

  @Prop({ default: 1 })
  attempts: number;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;
}

export const WebhookDeliverySchema = SchemaFactory.createForClass(WebhookDelivery);
WebhookDeliverySchema.index({ organizationId: 1, createdAt: -1 });
// Index TTL de purge automatique des logs de webhook après 30 jours
WebhookDeliverySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
