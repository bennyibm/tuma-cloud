import { Body, Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { EmailsService } from './emails.service';
import { ClientSendDto } from './dto/client-send.dto';

@Controller('v1/client')
export class ClientEmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  /**
   * Endpoint public d'envoi d'email depuis le navigateur / mobile sans serveur (Style EmailJS)
   */
  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED) // HTTP 202 Accepted
  async sendFromClient(
    @Body() dto: ClientSendDto,
    @Req() req: Request,
    @Headers('origin') originHeader?: string,
  ) {
    const origin = originHeader || (req.headers['origin'] as string);
    return this.emailsService.clientSendEmail(dto, origin);
  }
}
