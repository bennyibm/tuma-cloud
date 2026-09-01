import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, HydratedDocument } from 'mongoose';

export type DomainDocument = HydratedDocument<Domain>;

@Schema({ timestamps: true, collection: 'domains' })
export class Domain extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true })
  name: string; // ex: mail.acme.com

  @Prop({
    required: true,
    enum: ['pending', 'verified', 'failed', 'temporary_failure'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({
    type: Object,
    required: true,
    default: () => ({
      selector: 'tuma',
      publicKey: '',
      privateKeyEncrypted: '',
      host: '',
      value: '',
      status: 'pending',
    }),
  })
  dkim: {
    selector: string;
    publicKey: string;
    privateKeyEncrypted: string;
    host: string;
    value: string;
    status: string;
  };

  @Prop({
    type: Object,
    required: true,
    default: () => ({
      host: '',
      value: '',
      status: 'pending',
    }),
  })
  spf: {
    host: string;
    value: string;
    status: string;
  };

  @Prop({
    type: Object,
    default: () => ({
      host: '',
      value: 'v=DMARC1; p=none; rua=mailto:dmarc-reports@tuma.dev',
      status: 'pending',
    }),
  })
  dmarc: {
    host: string;
    value: string;
    status: string;
  };

  @Prop({ type: Date, default: null })
  verifiedAt: Date;
}

export const DomainSchema = SchemaFactory.createForClass(Domain);
DomainSchema.index({ organizationId: 1, name: 1 }, { unique: true });
