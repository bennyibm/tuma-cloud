import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Email, EmailDocument } from '../../schemas/email.schema';
import { EmailEvent, EmailEventDocument } from '../../schemas/email-event.schema';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly secretKey: string;
  private readonly baseUrl: string;

  // Buffer standard du pixel GIF 1x1 transparent (43 octets conformes GIF89a)
  private readonly transparentGifBuffer = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64',
  );

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>,
    @InjectModel(EmailEvent.name) private readonly eventModel: Model<EmailEventDocument>,
    private readonly webhooksService: WebhooksService,
  ) {
    this.secretKey = this.configService.get<string>(
      'MASTER_ENCRYPTION_KEY',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    );

    const configuredBaseUrl =
      this.configService.get<string>('TRACKING_BASE_URL') ||
      process.env.TRACKING_BASE_URL;

    if (configuredBaseUrl) {
      this.baseUrl = configuredBaseUrl.replace(/\/+$/, '');
    } else if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      this.baseUrl = 'https://api.tuma.eldnet.tech/v1/track';
    } else {
      this.baseUrl = 'http://localhost:3001/v1/track';
    }

    this.logger.log(`[Tracking] TrackingService initialisé avec baseUrl: ${this.baseUrl}`);
  }

  /**
   * Génère un jeton signé HMAC pour un email
   */
  generateToken(emailId: string, organizationId: string): string {
    const payload = `${emailId}:${organizationId}`;
    const hmac = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
    const tokenData = Buffer.from(JSON.stringify({ emailId, organizationId, hmac })).toString('base64url');
    return tokenData;
  }

  /**
   * Vérifie et décode un jeton signé
   */
  verifyToken(token: string): { emailId: string; organizationId: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
      const { emailId, organizationId, hmac } = decoded;

      const expectedHmac = crypto
        .createHmac('sha256', this.secretKey)
        .update(`${emailId}:${organizationId}`)
        .digest('hex');

      if (!hmac || !expectedHmac || Buffer.byteLength(hmac) !== Buffer.byteLength(expectedHmac)) {
        return null;
      }

      const isValid = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
      if (!isValid) return null;

      return { emailId, organizationId };
    } catch {
      return null;
    }
  }

  /**
   * Injecte automatiquement le pixel d'ouverture et réécrit les liens pour le proxy de clics
   */
  injectTracking(emailId: string, organizationId: string, html: string): string {
    if (!html) return html;

    const token = this.generateToken(emailId, organizationId);

    // 1. Réécriture de tous les liens <a href="..."> pour le proxy de clics
    const wrappedHtml = html.replace(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi,
      (match, quote, originalUrl) => {
        if (
          originalUrl.startsWith('mailto:') ||
          originalUrl.startsWith('tel:') ||
          originalUrl.startsWith('#') ||
          originalUrl.includes('/v1/track/click')
        ) {
          return match;
        }

        const encodedUrl = encodeURIComponent(originalUrl);
        const trackingClickUrl = `${this.baseUrl}/click/${token}?url=${encodedUrl}`;
        return match.replace(originalUrl, trackingClickUrl);
      },
    );

    // 2. Injection du pixel transparent 1x1 conforme aux webmails (sans opacity:0 pour éviter les bloqueurs)
    const pixelTag = `<img src="${this.baseUrl}/open/${token}" width="1" height="1" border="0" alt="" style="height:1px !important; width:1px !important; border-width:0 !important; margin:0 !important; padding:0 !important; display:block !important;" />`;

    this.logger.log(`[Tracking] Pixel injecté pour l'email ${emailId} via ${this.baseUrl}/open/${token.slice(0, 16)}...`);

    if (wrappedHtml.includes('</body>')) {
      return wrappedHtml.replace('</body>', `${pixelTag}</body>`);
    }

    return `${wrappedHtml}${pixelTag}`;
  }

  /**
   * Enregistre l'événement d'ouverture d'un email et déclenche le webhook
   */
  async recordOpen(token: string, ip?: string, userAgent?: string): Promise<Buffer> {
    const data = this.verifyToken(token);
    if (data) {
      const email = await this.emailModel.findById(data.emailId);
      if (email) {
        // Incrémentation sécurisée du compteur d'ouvertures
        const currentOpens = email.tracking?.opens ?? 0;
        const isFirstOpen = currentOpens === 0;
        const nextStatus =
          email.status === 'sent' || email.status === 'delivered' ? 'opened' : email.status;

        await this.emailModel.findByIdAndUpdate(data.emailId, {
          $inc: { 'tracking.opens': 1 },
          ...(isFirstOpen ? { 'tracking.firstOpenedAt': new Date() } : {}),
          status: nextStatus,
        });

        // Enregistrement de l'événement dans la timeline
        await this.eventModel.create({
          emailId: data.emailId,
          organizationId: data.organizationId,
          type: 'opened',
          recipient: email.to[0] || 'unknown',
          metadata: { ip, userAgent },
          timestamp: new Date(),
        });

        // Déclenchement du webhook sortant "email.opened"
        await this.webhooksService.triggerEvent(data.organizationId, 'email.opened', {
          emailId: data.emailId,
          recipient: email.to[0],
          subject: email.subject,
          openCount: currentOpens + 1,
          ip,
          userAgent,
        });

        this.logger.log(`[Tracking] ✅ Email ${data.emailId} ouvert par ${email.to[0]} (Total ouvertures: ${currentOpens + 1}, IP: ${ip || 'inconnue'})`);
      } else {
        this.logger.warn(`[Tracking] Email ${data.emailId} introuvable dans la base`);
      }
    } else {
      this.logger.warn(`[Tracking] Jeton d'ouverture invalide ou expiré: ${token.slice(0, 16)}...`);
    }

    return this.transparentGifBuffer;
  }

  /**
   * Enregistre l'événement de clic, redirige et déclenche le webhook
   */
  async recordClick(token: string, targetUrl: string, ip?: string, userAgent?: string): Promise<string> {
    const data = this.verifyToken(token);
    const destination = targetUrl ? decodeURIComponent(targetUrl) : 'https://tuma.dev';

    if (data) {
      const email = await this.emailModel.findById(data.emailId);
      if (email) {
        const currentClicks = email.tracking?.clicks ?? 0;

        const nextStatus =
          email.status === 'sent' || email.status === 'delivered' || email.status === 'opened'
            ? 'clicked'
            : email.status;

        // Incrémentation du compteur de clics
        await this.emailModel.findByIdAndUpdate(data.emailId, {
          $inc: { 'tracking.clicks': 1 },
          'tracking.lastClickedAt': new Date(),
          status: nextStatus,
        });

        // Enregistrement de l'événement dans la timeline
        await this.eventModel.create({
          emailId: data.emailId,
          organizationId: data.organizationId,
          type: 'clicked',
          recipient: email.to[0] || 'unknown',
          metadata: { ip, userAgent, targetUrl: destination },
          timestamp: new Date(),
        });

        // Déclenchement du webhook sortant "email.clicked"
        await this.webhooksService.triggerEvent(data.organizationId, 'email.clicked', {
          emailId: data.emailId,
          recipient: email.to[0],
          targetUrl: destination,
          clickCount: currentClicks + 1,
          ip,
          userAgent,
        });

        this.logger.log(`[Tracking] ✅ Clic enregistré pour l'email ${data.emailId} vers ${destination} (Total clics: ${currentClicks + 1})`);
      } else {
        this.logger.warn(`[Tracking] Email ${data.emailId} introuvable pour le clic`);
      }
    } else {
      this.logger.warn(`[Tracking] Jeton de clic invalide ou expiré: ${token.slice(0, 16)}...`);
    }

    return destination;
  }
}
