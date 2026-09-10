import { Controller, Get, Logger, Param, Query, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { TrackingService } from './tracking.service';

@Controller('v1/track')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(private readonly trackingService: TrackingService) {}

  /**
   * Endpoint public du pixel d'ouverture invisible 1x1 GIF
   */
  @Get('open/:token')
  async trackOpen(@Param('token') token: string, @Req() req: Request, @Res() res: Response) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] as string;

    this.logger.log(`[TrackingController] Requête pixel d'ouverture reçue (IP: ${ip || 'inconnue'})`);

    const gifBuffer = await this.trackingService.recordOpen(token, ip, userAgent);

    // En-têtes HTTP de non-mise en cache stricts et CORS permissif pour les webmails
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', gifBuffer.length.toString());
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.end(gifBuffer);
  }

  /**
   * Endpoint public du proxy de redirection des clics (HTTP 302)
   */
  @Get('click/:token')
  async trackClick(
    @Param('token') token: string,
    @Query('url') targetUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] as string;

    this.logger.log(`[TrackingController] Requête clic reçue vers ${targetUrl || 'destination par défaut'}`);

    const destination = await this.trackingService.recordClick(token, targetUrl, ip, userAgent);

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Redirection immédiate HTTP 302 vers l'URL cible d'origine
    return res.redirect(destination);
  }
}
