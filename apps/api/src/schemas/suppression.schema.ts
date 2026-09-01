import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type SuppressionDocument = HydratedDocument<Suppression>;

@Schema({ timestamps: true, collection: 'suppressions' })
export class Suppression extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, enum: ['hard_bounce', 'spam_complaint', 'unsubscribe', 'manual_block'] })
  reason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Email', default: null })
  sourceEmailId: MongooseSchema.Types.ObjectId;
}

export const SuppressionSchema = SchemaFactory.createForClass(Suppression);

// Index unique pour vérification en O(1)
SuppressionSchema.index({ organizationId: 1, email: 1 }, { unique: true });
