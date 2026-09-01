import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({ timestamps: true, collection: 'api_keys' })
export class ApiKey extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['secret', 'public'] })
  type: 'secret' | 'public';

  @Prop({ required: true })
  prefix: string; // 'sk_live_' ou 'pk_live_'

  @Prop({ required: true, unique: true, index: true })
  keyHash: string; // Argon2id hash de la clé brute

  @Prop({ type: [String], default: [] })
  allowedOrigins: string[]; // CORS Whitelist pour les clés publiques

  @Prop({ type: String, default: '*' })
  ipWhitelist: string; // CIDR IP Whitelist (ex: 197.234.218.42/32 ou *)

  @Prop({ required: false })
  rawKeyPreview?: string; // e.g. sk_live_... pour affichage partiel

  @Prop({ type: [String], default: ['emails:send'] })
  scopes: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  lastUsedAt: Date;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
