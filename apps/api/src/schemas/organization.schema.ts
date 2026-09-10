import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ timestamps: true, collection: 'organizations' })
export class Organization extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, enum: ['free', 'starter', 'pro', 'scale', 'enterprise'], default: 'free' })
  plan: string;

  @Prop({ required: true, default: 1000 })
  monthlyQuota: number;

  @Prop({ required: true, default: 0 })
  monthlyEmailsSent: number;

  @Prop({ required: true, default: 0 })
  prepaidCredits: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
