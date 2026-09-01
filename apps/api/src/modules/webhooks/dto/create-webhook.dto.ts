import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl({ require_tld: false }, { message: 'url must be a valid HTTP or HTTPS endpoint' })
  @IsNotEmpty()
  url: string;

  @IsArray()
  @IsOptional()
  events?: string[]; // ['email.sent', 'email.delivered', 'email.opened', 'email.clicked', 'email.bounced']

  @IsString()
  @IsOptional()
  description?: string;
}
