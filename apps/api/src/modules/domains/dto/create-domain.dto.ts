import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/, {
    message: 'Domain name must be a valid FQDN (e.g. mail.acme.com or acme.com)',
  })
  name: string;
}
