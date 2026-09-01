import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type EmailEventDocument = HydratedDocument<EmailEvent>;

@Schema({ timestamps: true, collection: 'email_events' })
export class EmailEvent extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Email', required: true, index: true })
  emailId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed'],
    index: true,
  })
  type: string;

  @Prop({ required: true })
  recipient: string;

  @Prop({ type: Object, default: {} })
  metadata: {
    ip?: string;
    userAgent?: string;
    targetUrl?: string;
    bounceReason?: string;
    isBotScanner?: boolean;
  };

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;
}

export const EmailEventSchema = SchemaFactory.createForClass(EmailEvent);

// Index composé pour requêter la timeline chronologique d'un email
EmailEventSchema.index({ emailId: 1, timestamp: 1 });
// Index TTL pour archiver / purger automatiquement après 90 jours
EmailEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
