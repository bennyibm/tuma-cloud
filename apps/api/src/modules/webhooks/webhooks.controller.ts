import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@Controller('v1/webhooks')
@UseGuards(ApiKeyGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWebhook(@Req() req: any, @Body() dto: CreateWebhookDto) {
    const organizationId = req.organizationId;
    return this.webhooksService.createWebhook(organizationId, dto);
  }

  @Get()
  async listWebhooks(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.webhooksService.listWebhooks(organizationId);
  }

  @Get('deliveries')
  async listDeliveries(@Req() req: any, @Query('webhookId') webhookId?: string) {
    const organizationId = req.organizationId;
    return this.webhooksService.listDeliveries(organizationId, webhookId);
  }

  @Get(':id')
  async getWebhook(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.webhooksService.getWebhook(organizationId, id);
  }

  @Delete(':id')
  async deleteWebhook(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.webhooksService.deleteWebhook(organizationId, id);
  }
}
