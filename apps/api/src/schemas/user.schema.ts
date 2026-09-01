import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['owner', 'admin', 'developer', 'billing'], default: 'owner' })
  role: string;

  @Prop({ default: null })
  resetToken?: string;

  @Prop({ default: null })
  resetTokenExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
