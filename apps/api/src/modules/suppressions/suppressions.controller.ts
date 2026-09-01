import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { SuppressionsService } from './suppressions.service';

@Controller('v1/suppressions')
@UseGuards(ApiKeyGuard)
export class SuppressionsController {
  constructor(private readonly suppressionsService: SuppressionsService) {}

  @Get()
  async listSuppressions(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.suppressionsService.listSuppressions(organizationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addSuppression(@Req() req: any, @Body() body: { email: string; reason?: any }) {
    const organizationId = req.organizationId;
    return this.suppressionsService.addSuppression(organizationId, body.email, body.reason);
  }

  @Delete(':id')
  async removeSuppression(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.suppressionsService.removeSuppression(organizationId, id);
  }
}
