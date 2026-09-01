import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { TemplatesService } from './templates.service';

@Controller('v1/templates')
@UseGuards(ApiKeyGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async listTemplates(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.templatesService.listTemplates(organizationId);
  }

  @Get(':slug')
  async getTemplate(@Req() req: any, @Param('slug') slug: string) {
    const organizationId = req.organizationId;
    return this.templatesService.getTemplate(organizationId, slug);
  }

  @Post()
  async saveTemplate(@Req() req: any, @Body() body: any) {
    const organizationId = req.organizationId;
    return this.templatesService.saveTemplate(organizationId, body);
  }

  @Delete(':slug')
  async deleteTemplate(@Req() req: any, @Param('slug') slug: string) {
    const organizationId = req.organizationId;
    return this.templatesService.deleteTemplate(organizationId, slug);
  }
}
