import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true, collection: 'templates' })
export class Template extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  html: string;

  @Prop({ default: null })
  text: string;

  @Prop({ type: [String], default: [] })
  requiredVariables: string[];
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
