import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ClientSendDto {
  @IsString()
  @IsNotEmpty({ message: 'publicKey is required (format: pk_live_...)' })
  publicKey: string;

  @IsString()
  @IsNotEmpty({ message: 'template slug or ID is required for client-side sending' })
  template: string;

  @IsObject()
  @IsNotEmpty({ message: 'variables object is required' })
  variables: Record<string, any>;

  @IsString()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  turnstileToken?: string;

  @IsString()
  @IsOptional()
  _honeypot?: string; // Champ piège anti-spam
}
