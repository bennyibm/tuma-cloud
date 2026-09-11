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

  @Prop({ required: false, default: null })
  passwordHash?: string;

  @Prop({ required: true, enum: ['owner', 'admin', 'developer', 'billing'], default: 'owner' })
  role: string;

  @Prop({ default: null, index: true, sparse: true })
  googleId?: string;

  @Prop({ default: null, index: true, sparse: true })
  githubId?: string;

  @Prop({ default: null })
  avatarUrl?: string;

  @Prop({ required: true, enum: ['local', 'google', 'github'], default: 'local' })
  authProvider: string;

  @Prop({ default: null })
  resetToken?: string;

  @Prop({ default: null })
  resetTokenExpiresAt?: Date;

  @Prop({ default: false, index: true })
  isActivated: boolean;

  @Prop({ default: null })
  activationOtp?: string;

  @Prop({ default: null })
  activationOtpExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
