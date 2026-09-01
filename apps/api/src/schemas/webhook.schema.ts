import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type WebhookDocument = HydratedDocument<Webhook>;

@Schema({ timestamps: true, collection: 'webhooks' })
export class Webhook extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: true })
  secret: string; // Format 'whsec_...'

  @Prop({
    type: [String],
    required: true,
    default: ['email.sent', 'email.delivered', 'email.opened', 'email.clicked', 'email.bounced'],
  })
  events: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: '' })
  description: string;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
WebhookSchema.index({ organizationId: 1, url: 1 });
