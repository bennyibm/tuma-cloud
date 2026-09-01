import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { AuthService } from './auth.service';

@Controller('v1/api-keys')
@UseGuards(ApiKeyGuard)
export class ApiKeysController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async listApiKeys(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.authService.listApiKeys(organizationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @Req() req: any,
    @Body() body: { name: string; type: 'secret' | 'public'; ipWhitelist?: string; scopes?: string[] },
  ) {
    const organizationId = req.organizationId;
    return this.authService.createApiKey(organizationId, body);
  }

  @Delete(':id')
  async deleteApiKey(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.authService.deleteApiKey(organizationId, id);
  }
}
