import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type EmailDocument = HydratedDocument<Email>;

@Schema({ timestamps: true, collection: 'emails' })
export class Email extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Domain', default: null })
  domainId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Template', default: null })
  templateId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  from: string;

  @Prop({ type: [String], required: true })
  to: string[];

  @Prop({ type: [String], default: [] })
  cc: string[];

  @Prop({ type: [String], default: [] })
  bcc: string[];

  @Prop({ default: null })
  replyTo: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ default: null })
  html: string;

  @Prop({ default: null })
  text: string;

  @Prop({
    required: true,
    enum: ['queued', 'sending', 'sent', 'delivered', 'bounced', 'complained', 'failed'],
    default: 'queued',
    index: true,
  })
  status: string;

  @Prop({ default: null, index: true })
  idempotencyKey: string;

  @Prop({ default: null })
  providerMessageId: string;

  @Prop({ default: 'mailpit' })
  provider: string;

  @Prop({ type: Object, default: {} })
  variables: Record<string, any>;

  @Prop({ type: [Object], default: [] })
  tags: Array<{ name: string; value: string }>;

  @Prop({ type: Object, default: { opens: 0, clicks: 0, firstOpenedAt: null, lastClickedAt: null } })
  tracking: {
    opens: number;
    clicks: number;
    firstOpenedAt?: Date;
    lastClickedAt?: Date;
  };

  @Prop({ type: Object, default: null })
  fallback?: {
    enabled: boolean;
    phone: string;
    channel: string;
  };

  @Prop({ type: String, default: null })
  errorMessage: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);

// Index composé pour l'idempotence et les requêtes par organisation
EmailSchema.index(
  { organizationId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);
EmailSchema.index({ organizationId: 1, createdAt: -1 });
