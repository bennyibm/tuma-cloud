import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { EmailsService } from './emails.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('v1/emails')
@UseGuards(ApiKeyGuard)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  /**
   * Endpoint principal d'ingestion d'email (Backend / Clé secrète)
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED) // HTTP 202 Accepted
  async sendEmail(
    @Req() req: any,
    @Body() dto: SendEmailDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const organizationId = req.organizationId;
    return this.emailsService.sendEmail(organizationId, dto, idempotencyKey);
  }

  /**
   * Métriques en direct pour le dashboard
   */
  @Get('metrics')
  async getMetrics(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.emailsService.getMetrics(organizationId);
  }

  /**
   * Liste les emails envoyés
   */
  @Get()
  async listEmails(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.emailsService.listEmails(organizationId);
  }

  /**
   * Récupère le statut et les événements d'un email
   */
  @Get(':id')
  async getEmail(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.emailsService.getEmailById(organizationId, id);
  }
}
