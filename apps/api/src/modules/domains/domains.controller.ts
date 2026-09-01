import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';

@Controller('v1/domains')
@UseGuards(ApiKeyGuard)
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDomain(@Req() req: any, @Body() dto: CreateDomainDto) {
    const organizationId = req.organizationId;
    return this.domainsService.createDomain(organizationId, dto);
  }

  @Get()
  async listDomains(@Req() req: any) {
    const organizationId = req.organizationId;
    return this.domainsService.listDomains(organizationId);
  }

  @Get(':id')
  async getDomain(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.domainsService.getDomain(organizationId, id);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verifyDomain(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.domainsService.verifyDomain(organizationId, id);
  }

  @Delete(':id')
  async deleteDomain(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.organizationId;
    return this.domainsService.deleteDomain(organizationId, id);
  }
}
