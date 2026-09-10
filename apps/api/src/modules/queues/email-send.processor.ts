import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from '../../schemas/email.schema';
import { EmailEvent, EmailEventDocument } from '../../schemas/email-event.schema';
import { MailpitTransporter } from '../transporters/mailpit.transporter';
import { TemplateCompilerService } from '../templates/template-compiler.service';
import { TrackingService } from '../tracking/tracking.service';
import { WebhooksService } from '../webhooks/webhooks.service';

export interface EmailJobData {
  emailId: string;
  organizationId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  variables?: Record<string, any>;
  attachments?: any[];
}

@Processor('email-send-queue')
export class EmailSendProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailSendProcessor.name);

  constructor(
    @InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>,
    @InjectModel(EmailEvent.name) private readonly eventModel: Model<EmailEventDocument>,
    private readonly mailpitTransporter: MailpitTransporter,
    private readonly templateCompiler: TemplateCompilerService,
    private readonly trackingService: TrackingService,
    private readonly webhooksService: WebhooksService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    return this.handleEmailSend(job.data, String(job.id));
  }

  /**
   * Traitement direct sans passer par BullMQ (utile en failover ou en environnement serverless)
   */
  async processDirect(data: EmailJobData): Promise<any> {
    return this.handleEmailSend(data, `direct-${Date.now()}`);
  }

  /**
   * Cœur de traitement de l'envoi d'email
   */
  async handleEmailSend(data: EmailJobData, jobId: string = 'internal'): Promise<any> {
    const { emailId, organizationId, from, to, cc, bcc, replyTo, subject, html, text, variables, attachments } = data;
    this.logger.log(`[Job ${jobId}] Traitement de l'envoi pour l'email ${emailId} vers ${to.join(', ')}`);

    try {
      // 1. Mise à jour de l'état en "sending"
      await this.emailModel.findByIdAndUpdate(emailId, { status: 'sending' });

      // 2. Compilation Handlebars du sujet et du HTML
      const compiledSubject = this.templateCompiler.compile(subject, variables);
      let compiledHtml = html ? this.templateCompiler.compile(html, variables) : '';

      // Si aucun HTML n'est spécifié mais qu'un texte existe, on génère un HTML basique pour permettre l'injection du pixel
      if (!compiledHtml && text) {
        const compiledText = this.templateCompiler.compile(text, variables);
        compiledHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #111827;">${compiledText.replace(/\r\n|\n/g, '<br />')}</div>`;
      }

      // 3. Injection du pixel 1x1 et réécriture des liens pour le tracking des clics
      if (compiledHtml) {
        compiledHtml = this.trackingService.injectTracking(emailId, organizationId, compiledHtml);
      }

      const finalPlainText = text
        ? this.templateCompiler.compile(text, variables)
        : this.templateCompiler.generatePlainText(compiledHtml);

      // 4. Envoi via le transporteur SMTP
      const sendResult = await this.mailpitTransporter.send({
        from,
        to,
        cc,
        bcc,
        replyTo,
        subject: compiledSubject,
        html: compiledHtml,
        text: finalPlainText,
        attachments,
      });

      // 5. Mise à jour de l'état en "sent"
      await this.emailModel.findByIdAndUpdate(emailId, {
        status: 'sent',
        providerMessageId: sendResult.providerMessageId,
        provider: sendResult.provider,
      });

      // 6. Enregistrement de l'événement initial "sent" dans la timeline
      await this.eventModel.create({
        emailId,
        organizationId,
        type: 'sent',
        recipient: to[0],
        metadata: { providerMessageId: sendResult.providerMessageId },
        timestamp: new Date(),
      });

      // 7. Déclenchement du Webhook sortant "email.sent"
      await this.webhooksService.triggerEvent(organizationId, 'email.sent', {
        emailId,
        from,
        to,
        subject: compiledSubject,
        providerMessageId: sendResult.providerMessageId,
        status: 'sent',
      });

      this.logger.log(`[Job ${jobId}] Email ${emailId} envoyé avec succès (ID: ${sendResult.providerMessageId})`);
      return sendResult;
    } catch (error: any) {
      this.logger.error(`[Job ${jobId}] Échec de l'envoi pour l'email ${emailId}: ${error.message}`, error.stack);
      await this.emailModel.findByIdAndUpdate(emailId, {
        status: 'failed',
        errorMessage: error.message,
      });

      await this.eventModel.create({
        emailId,
        organizationId,
        type: 'failed',
        recipient: to[0] || 'unknown',
        metadata: { error: error.message },
        timestamp: new Date(),
      });

      await this.webhooksService.triggerEvent(organizationId, 'email.failed', {
        emailId,
        from,
        to,
        error: error.message,
        status: 'failed',
      });

      throw error;
    }
  }
}
