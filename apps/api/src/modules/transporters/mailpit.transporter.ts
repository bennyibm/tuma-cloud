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

    // 3. Support natif LWS PHP Bridge HTTPS (Port 443)
    const bridgeUrl = this.configService.get<string>('LWS_BRIDGE_URL');
    if (bridgeUrl) {
      this.logger.log(`[HTTP API] Envoi sécurisé via LWS PHP Bridge vers ${options.to.join(', ')}`);
      const bridgeSecret = this.configService.get<string>('LWS_BRIDGE_SECRET', '');
      const response = await fetch(bridgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(bridgeSecret ? { Authorization: `Bearer ${bridgeSecret.trim()}` } : {}),
        },
        body: JSON.stringify({
          from: options.from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo,
        }),
      });

      const data: any = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Erreur LWS Bridge HTTP ${response.status}`);
      }

      return {
        providerMessageId: data.messageId || `<lws-${Date.now()}@eldnet.tech>`,
        provider: 'lws_bridge',
        rawResponse: data,
      };
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
      const isExternalSmtpConfigured =
        (this.host !== 'localhost' && this.host !== '127.0.0.1') ||
        Boolean(this.configService.get<string>('SMTP_USER'));

      if (isExternalSmtpConfigured) {
        this.logger.error(`[SMTP Relay Error] Échec de l'envoi réel via ${this.host}:${this.port}: ${err.message}`);
        throw err;
      }

      // Si aucun relais SMTP réel n'est configuré (mode développement local sans Mailpit) : simulation
      if (
        err.code === 'ECONNREFUSED' ||
        err.code === 'ESOCKET' ||
        err.code === 'ETIMEDOUT' ||
        err.message?.includes('connect ECONNREFUSED')
      ) {
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
