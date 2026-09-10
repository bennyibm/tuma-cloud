import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ITransporter, SendMailOptions, SendMailResult } from './transporter.interface';

@Injectable()
export class MailpitTransporter implements ITransporter {
  private readonly logger = new Logger(MailpitTransporter.name);
  private transporter: nodemailer.Transporter;
  private readonly host: string;
  private readonly port: number;

  constructor(private readonly configService: ConfigService) {
    this.host = this.configService.get<string>('SMTP_HOST', 'localhost');
    this.port = Number(this.configService.get<number>('SMTP_PORT', 1025));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true' || this.port === 465;

    const transportConfig: any = {
      host: this.host,
      port: this.port,
      secure,
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    };

    if (user && pass) {
      transportConfig.auth = { user, pass };
    } else {
      transportConfig.ignoreTLS = true;
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    this.logger.log(`Envoi de l'email à destination de : ${options.to.join(', ')}`);

    // 1. Support natif Resend via HTTPS API (Port 443 - Jamais bloqué par Render Free)
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      this.logger.log(`[HTTP API] Envoi sécurisé via Resend HTTPS API vers ${options.to.join(', ')}`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: options.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Erreur Resend API HTTP ${response.status}`);
      }

      return {
        providerMessageId: data.id,
        provider: 'resend',
        rawResponse: data,
      };
    }

    // 2. Support natif Brevo via HTTPS API (Port 443 - Jamais bloqué par Render Free)
    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    if (brevoApiKey) {
      this.logger.log(`[HTTP API] Envoi sécurisé via Brevo HTTPS API vers ${options.to.join(', ')}`);
      const match = options.from.match(/^(?:(.*?)<)?([^>]+)>?$/);
      const senderName = match?.[1]?.trim();
      const senderEmail = match?.[2]?.trim() || options.from;

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: senderName ? { name: senderName, email: senderEmail } : { email: senderEmail },
          to: options.to.map((email) => ({ email })),
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
          replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Erreur Brevo API HTTP ${response.status}`);
      }

      return {
        providerMessageId: data.messageId || `brevo-${Date.now()}`,
        provider: 'brevo',
        rawResponse: data,
      };
    }

    // 3. Support natif LWS PHP Bridge (Port 80 / 443 - Contourne le blocage des ports SMTP sur Render)
    const defaultBridgeUrl = 'https://bridges.eldnet.tech/tuma-bridge.php';
    const defaultBridgeSecret = '53252ddafb841d3defe44023c025d56cd308a6dca1776d3f';

    const explicitBridgeUrl =
      this.configService.get<string>('LWS_BRIDGE_URL') ||
      process.env.LWS_BRIDGE_URL ||
      this.configService.get<string>('BRIDGE_URL') ||
      process.env.BRIDGE_URL;

    const isEldnetInfrastructure =
      this.host.includes('eldnet.tech') ||
      (options.from && options.from.includes('eldnet.tech')) ||
      (Array.isArray(options.to) && options.to.some((t) => t.includes('eldnet.tech')));

    const bridgeUrl =
      explicitBridgeUrl || (isEldnetInfrastructure ? defaultBridgeUrl : null);

    const bridgeSecret =
      this.configService.get<string>('LWS_BRIDGE_SECRET') ||
      process.env.LWS_BRIDGE_SECRET ||
      this.configService.get<string>('BRIDGE_SECRET') ||
      process.env.BRIDGE_SECRET ||
      defaultBridgeSecret;

    this.logger.log(
      `[Transporter] Routage email - host: ${this.host}:${this.port}, bridge: ${bridgeUrl || 'DÉSACTIVÉ'}`,
    );

    if (bridgeUrl) {
      try {
        return await this.sendViaBridge(bridgeUrl, bridgeSecret, options);
      } catch (bridgeErr: any) {
        this.logger.error(`[LWS Bridge Error] Échec via bridge: ${bridgeErr.message}`);
        // Si le bridge échoue et qu'un serveur SMTP externe est configuré, tenter le SMTP classique
      }
    }

    // 4. Envoi classique via SMTP (LWS, Gmail, etc.)
    try {
      const result = await this.transporter.sendMail({
        from: options.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        headers: options.headers,
        attachments: options.attachments,
      });

      return {
        providerMessageId: result.messageId,
        provider: this.configService.get<string>('SMTP_PROVIDER', 'smtp_relay'),
        rawResponse: result,
      };
    } catch (err: any) {
      const isConnectionTimeout =
        err.code === 'ECONNREFUSED' ||
        err.code === 'ESOCKET' ||
        err.code === 'ETIMEDOUT' ||
        err.message?.includes('Connection timeout') ||
        err.message?.includes('ETIMEDOUT') ||
        err.message?.includes('connect ECONNREFUSED');

      // Secours d'urgence : si le port SMTP a été bloqué (Render Free) et que le bridge n'avait pas été appelé
      if (isConnectionTimeout && isEldnetInfrastructure && !bridgeUrl) {
        this.logger.warn(
          `[SMTP Port Bloqué] Timeout vers ${this.host}:${this.port}. Tentative de secours automatique via le LWS Bridge...`,
        );
        try {
          return await this.sendViaBridge(defaultBridgeUrl, defaultBridgeSecret, options);
        } catch (fallbackErr: any) {
          this.logger.error(`[Secours Bridge Error] ${fallbackErr.message}`);
        }
      }

      const isExternalSmtpConfigured =
        (this.host !== 'localhost' && this.host !== '127.0.0.1') ||
        Boolean(this.configService.get<string>('SMTP_USER'));

      if (isExternalSmtpConfigured) {
        this.logger.error(`[SMTP Relay Error] Échec de l'envoi réel via ${this.host}:${this.port}: ${err.message}`);
        throw err;
      }

      // Si aucun relais SMTP réel n'est configuré (mode développement local sans Mailpit) : simulation
      if (isConnectionTimeout) {
        const simulatedMessageId = `<tuma-edge-${Date.now()}-${Math.random().toString(36).substring(7)}@tuma.eldnet.tech>`;
        this.logger.warn(
          `[SMTP Simulation] Aucun serveur SMTP externe configuré (${this.host}:${this.port}). Délivrance simulée (MessageID: ${simulatedMessageId})`,
        );

        return {
          providerMessageId: simulatedMessageId,
          provider: 'tuma-edge-simulator',
          rawResponse: { simulated: true, originalError: err.message },
        };
      }

      throw err;
    }
  }

  private async sendViaBridge(
    bridgeUrl: string,
    bridgeSecret: string,
    options: SendMailOptions,
  ): Promise<SendMailResult> {
    this.logger.log(`[HTTP API] Envoi sécurisé via LWS PHP Bridge (${bridgeUrl}) vers ${options.to.join(', ')}`);
    const payload = JSON.stringify({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      smtpPass: this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS,
      smtpUser: this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER,
      smtpHost: this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST || 'mail.eldnet.tech',
      smtpPort: Number(this.configService.get<number>('SMTP_PORT')) || Number(process.env.SMTP_PORT) || 587,
    });

    const data = await new Promise<any>((resolve, reject) => {
      const parsedUrl = new URL(bridgeUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? require('https') : require('http');

      const req = client.request(
        parsedUrl,
        {
          method: 'POST',
          rejectUnauthorized: false,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Content-Length': Buffer.byteLength(payload),
            ...(bridgeSecret
              ? {
                  Authorization: `Bearer ${bridgeSecret.trim()}`,
                  'X-Tuma-Secret': bridgeSecret.trim(),
                }
              : {}),
          },
          timeout: 15000,
        },
        (res: any) => {
          let body = '';
          res.on('data', (chunk: any) => (body += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (res.statusCode >= 200 && res.statusCode < 300 && parsed.success) {
                resolve(parsed);
              } else {
                reject(
                  new Error(parsed.error || `Erreur LWS Bridge HTTP ${res.statusCode}: ${body.slice(0, 150)}`),
                );
              }
            } catch {
              reject(
                new Error(`Réponse non-JSON du Bridge LWS (HTTP ${res.statusCode}): ${body.slice(0, 150)}`),
              );
            }
          });
        },
      );

      req.on('error', (err: any) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout de connexion vers LWS Bridge (15s)'));
      });
      req.write(payload);
      req.end();
    });

    this.logger.log(
      `[LWS Bridge] Résultat d'envoi: mode=${data.mode || 'standard'}, messageId=${data.messageId}`,
    );

    if (data.mode && data.mode.startsWith('php_mail')) {
      this.logger.warn(
        `[LWS Bridge SPF Alert] L'email a été expédié via ${data.mode} sans authentification SMTP directe. Renseignez SMTP_PASS pour expédier via mail.eldnet.tech et éviter le dossier Spam de Gmail.`,
      );
    }

    return {
      providerMessageId: data.messageId || `<lws-${Date.now()}@eldnet.tech>`,
      provider: 'lws_bridge',
      rawResponse: data,
    };
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (err) {
      this.logger.error('Échec de connexion au serveur SMTP Mailpit', err);
      return false;
    }
  }
}
