import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsString()
  @IsOptional()
  reply_to?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  template?: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;

  @IsArray()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;

  @IsArray()
  @IsOptional()
  tags?: Array<{ name: string; value: string }>;

  @IsObject()
  @IsOptional()
  fallback?: {
    enabled: boolean;
    phone: string;
    channel: string;
  };
}
