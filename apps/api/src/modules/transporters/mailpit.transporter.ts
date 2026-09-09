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
        provider: this.configService.get<string>('SMTP_PROVIDER', 'mailpit'),
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
