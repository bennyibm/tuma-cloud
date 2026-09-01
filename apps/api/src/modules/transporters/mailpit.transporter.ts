import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ITransporter, SendMailOptions, SendMailResult } from './transporter.interface';

@Injectable()
export class MailpitTransporter implements ITransporter {
  private readonly logger = new Logger(MailpitTransporter.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'localhost');
    const port = this.configService.get<number>('SMTP_PORT', 1025);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      ignoreTLS: true,
    });
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    this.logger.log(`Envoi de l'email à destination de : ${options.to.join(', ')}`);

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
      provider: 'mailpit',
      rawResponse: result,
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
