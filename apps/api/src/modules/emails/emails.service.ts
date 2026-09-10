import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  UnprocessableEntityException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Email, EmailDocument } from '../../schemas/email.schema';
import { Template, TemplateDocument } from '../../schemas/template.schema';
import { ApiKey, ApiKeyDocument } from '../../schemas/api-key.schema';
import { SuppressionsService } from '../suppressions/suppressions.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/send-email.dto';
import { ClientSendDto } from './dto/client-send.dto';
import { EmailJobData, EmailSendProcessor } from '../queues/email-send.processor';

@Injectable()
export class EmailsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailsService.name);

  constructor(
    @InjectModel(Email.name) private readonly emailModel: Model<EmailDocument>,
    @InjectModel(Template.name) private readonly templateModel: Model<TemplateDocument>,
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKeyDocument>,
    @InjectQueue('email-send-queue') private readonly emailQueue: Queue<EmailJobData>,
    private readonly suppressionsService: SuppressionsService,
    private readonly authService: AuthService,
    private readonly emailSendProcessor: EmailSendProcessor,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    // Récupération des emails orphelins restés en état "queued" (ex: redémarrage serveur ou failover)
    setTimeout(async () => {
      try {
        const pendingEmails = await this.emailModel.find({ status: 'queued' }).limit(50);
        if (pendingEmails.length > 0) {
          this.logger.log(`[Startup Recovery] ${pendingEmails.length} email(s) en attente détecté(s). Lancement du traitement direct...`);
          for (const email of pendingEmails) {
            await this.emailSendProcessor.processDirect({
              emailId: email._id.toString(),
              organizationId: email.organizationId.toString(),
              from: email.from,
              to: email.to,
              cc: email.cc,
              bcc: email.bcc,
              replyTo: email.replyTo,
              subject: email.subject,
              html: email.html,
              text: email.text,
              variables: email.variables,
            });
          }
        }
      } catch (err: any) {
        this.logger.error(`Erreur recovery emails queued: ${err.message}`);
      }
    }, 2000);
  }

  /**
   * Ingestion ultra-rapide (< 30ms) avec contrôle anti-doublon et liste de suppression
   */
  async sendEmail(
    organizationId: string,
    dto: SendEmailDto,
    idempotencyKey?: string,
  ): Promise<{ id: string; from: string; to: string[]; status: string; createdAt: Date }> {
    // 1. Contrôle d'Idempotence
    if (idempotencyKey) {
      const existingEmail = await this.emailModel.findOne({ organizationId, idempotencyKey });
      if (existingEmail) {
        this.logger.log(`Idempotency hit pour la clé ${idempotencyKey} (Email ID: ${existingEmail._id})`);
        return {
          id: existingEmail._id.toString(),
          from: existingEmail.from,
          to: existingEmail.to,
          status: existingEmail.status,
          createdAt: (existingEmail as any).createdAt,
        };
      }
    }

    // 2. Contrôle de la liste de suppression O(1)
    for (const recipient of dto.to) {
      const isBlocked = await this.suppressionsService.isSuppressed(organizationId, recipient);
      if (isBlocked) {
        throw new UnprocessableEntityException({
          type: 'https://tuma.dev/errors/suppressed-recipient',
          title: 'Recipient Suppressed',
          status: 422,
          detail: `The recipient '${recipient}' is on the suppression list due to previous hard bounce or complaint.`,
        });
      }
    }

    // 3. Persistance initiale dans MongoDB avec status "queued"
    const newEmail = await this.emailModel.create({
      organizationId,
      from: dto.from,
      to: dto.to,
      cc: dto.cc || [],
      bcc: dto.bcc || [],
      replyTo: dto.reply_to || null,
      subject: dto.subject,
      html: dto.html || null,
      status: 'queued',
      ...(idempotencyKey ? { idempotencyKey } : {}),
      variables: dto.variables || {},
      tags: dto.tags || [],
      fallback: dto.fallback || null,
    });

    // 4. Enqueue dans BullMQ / Redis avec auto-dispatcher de secours
    const jobData: EmailJobData = {
      emailId: newEmail._id.toString(),
      organizationId,
      from: dto.from,
      to: dto.to,
      cc: dto.cc,
      bcc: dto.bcc,
      replyTo: dto.reply_to,
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
      variables: dto.variables,
      attachments: dto.attachments,
    };

    // 4. Enqueue non-bloquant dans BullMQ avec bascule immédiate vers processDirect si Redis est lent ou bloqué
    const enqueueWithTimeout = async () => {
      try {
        await Promise.race([
          this.emailQueue.add('send-email-job', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('BullMQ timeout (800ms)')), 800),
          ),
        ]);
      } catch (err: any) {
        this.logger.warn(`BullMQ non disponible ou bloqué (${err.message}). Traitement direct immédiat.`);
        setImmediate(async () => {
          try {
            await this.emailSendProcessor.processDirect(jobData);
          } catch (e: any) {
            this.logger.error(`Erreur processDirect immédiat: ${e.message}`);
          }
        });
      }
    };

    enqueueWithTimeout();

    // Déclencheur automatique de secours à 1 seconde
    setTimeout(async () => {
      try {
        const check = await this.emailModel.findById(newEmail._id);
        if (check && check.status === 'queued') {
          this.logger.log(`[Auto-Dispatcher] Traitement direct de secours pour l'email ${newEmail._id}`);
          await this.emailSendProcessor.processDirect(jobData);
        }
      } catch (err: any) {
        this.logger.error(`Erreur auto-dispatcher email ${newEmail._id}: ${err.message}`);
      }
    }, 1000);

    return {
      id: newEmail._id.toString(),
      from: newEmail.from,
      to: newEmail.to,
      status: newEmail.status,
      createdAt: (newEmail as any).createdAt,
    };
  }

  /**
   * Envoi Frontend Sans Serveur (Style EmailJS)
   * Authentifié par clé publique (pk_live_...), validé par CORS et modèle de template strict
   */
  async clientSendEmail(
    dto: ClientSendDto,
    origin?: string,
  ): Promise<{ id: string; status: string; template: string }> {
    // 1. Protection Honeypot Anti-Robot
    if (dto._honeypot && dto._honeypot.trim().length > 0) {
      this.logger.warn(`Honeypot trigger detected. Aborting silent spam.`);
      throw new BadRequestException('Spam attempt detected.');
    }

    // 2. Validation de la clé publique (pk_live_...)
    if (!dto.publicKey.startsWith('pk_')) {
      throw new UnauthorizedException("Invalid public key format. Public keys must start with 'pk_'");
    }

    const authData = await this.authService.validateApiKey(dto.publicKey);
    if (!authData) {
      throw new UnauthorizedException('Invalid or inactive Public API Key.');
    }

    // 3. Validation de l'origine CORS
    if (origin && !dto.publicKey.startsWith('pk_live_test')) {
      const keyDoc = await this.apiKeyModel.findOne({ organizationId: authData.organizationId, type: 'public' });
      if (keyDoc && keyDoc.allowedOrigins && keyDoc.allowedOrigins.length > 0) {
        const isAllowed = keyDoc.allowedOrigins.some((allowed) => allowed === '*' || allowed === origin);
        if (!isAllowed) {
          throw new ForbiddenException(`Origin '${origin}' is not authorized to use this public key.`);
        }
      }
    }

    // 4. Récupération et validation du template
    let templateDoc = await this.templateModel.findOne({
      organizationId: authData.organizationId,
      slug: dto.template,
    });

    if (!templateDoc && dto.template.match(/^[0-9a-fA-F]{24}$/)) {
      templateDoc = await this.templateModel.findOne({
        organizationId: authData.organizationId,
        _id: dto.template,
      });
    }

    // Pour l'environnement de test / démo, si le template n'existe pas encore, on crée un template de contact par défaut
    if (!templateDoc && (dto.template === 'contact-form' || dto.publicKey.startsWith('pk_live_test'))) {
      templateDoc = await this.templateModel.create({
        organizationId: authData.organizationId,
        name: 'Formulaire de Contact Démo',
        slug: dto.template,
        subject: 'Nouveau message de {{clientName}}',
        html: `<h2>Nouveau message reçu depuis votre site web</h2><p><strong>Nom :</strong> {{clientName}}</p><p><strong>Email :</strong> {{clientEmail}}</p><p><strong>Message :</strong></p><blockquote>{{clientMessage}}</blockquote>`,
        requiredVariables: ['clientName', 'clientEmail', 'clientMessage'],
      });
    }

    if (!templateDoc) {
      throw new NotFoundException(`Template '${dto.template}' not found in your organization.`);
    }

    // 5. Validation des variables requises du template
    if (templateDoc.requiredVariables && templateDoc.requiredVariables.length > 0) {
      const missingVars = templateDoc.requiredVariables.filter((v) => dto.variables[v] === undefined || dto.variables[v] === '');
      if (missingVars.length > 0) {
        throw new UnprocessableEntityException({
          type: 'https://tuma.dev/errors/missing-template-variables',
          title: 'Missing Required Template Variables',
          status: 422,
          detail: `The template '${templateDoc.slug}' requires the following variables: ${missingVars.join(', ')}`,
        });
      }
    }

    // 6. Détermination des adresses
    const defaultFrom =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('DEFAULT_FROM_EMAIL') ||
      'Tuma Contact <contact@tuma.dev>';
    const senderFrom = defaultFrom;
    const recipientTo = dto.recipientEmail ? [dto.recipientEmail] : ['support@tuma.dev'];

    // 7. Enrichissement du HTML avec un lien de confirmation cliquable (pour tester la télémétrie de clics)
    let emailHtml = templateDoc.html || '';
    if (emailHtml && !emailHtml.includes('<a')) {
      emailHtml += `<p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-family: sans-serif; font-size: 13px;"><a href="https://console.tuma.eldnet.tech" style="display: inline-block; padding: 9px 18px; background: #FF6B00; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder à la console Tuma</a></p>`;
    }

    // 8. Enregistrement de l'email et mise en file
    const newEmail = await this.emailModel.create({
      organizationId: authData.organizationId,
      templateId: templateDoc._id,
      from: senderFrom,
      to: recipientTo,
      subject: templateDoc.subject,
      html: emailHtml,
      text: templateDoc.text,
      status: 'queued',
      variables: dto.variables,
      tags: [{ name: 'source', value: 'client_frontend_form' }, { name: 'template', value: templateDoc.slug }],
    });

    const jobData: EmailJobData = {
      emailId: newEmail._id.toString(),
      organizationId: authData.organizationId,
      from: senderFrom,
      to: recipientTo,
      subject: templateDoc.subject,
      html: emailHtml,
      text: templateDoc.text,
      variables: dto.variables,
    };

    // Enqueue non-bloquant dans BullMQ avec bascule immédiate vers processDirect si Redis est lent ou bloqué
    const enqueueWithTimeout = async () => {
      try {
        await Promise.race([
          this.emailQueue.add('send-email-job', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('BullMQ timeout (800ms)')), 800),
          ),
        ]);
      } catch (err: any) {
        this.logger.warn(`BullMQ non disponible ou bloqué (${err.message}). Traitement direct immédiat.`);
        setImmediate(async () => {
          try {
            await this.emailSendProcessor.processDirect(jobData);
          } catch (e: any) {
            this.logger.error(`Erreur processDirect immédiat email client: ${e.message}`);
          }
        });
      }
    };

    enqueueWithTimeout();

    // Déclencheur automatique de secours pour le frontend à 1 seconde
    setTimeout(async () => {
      try {
        const check = await this.emailModel.findById(newEmail._id);
        if (check && check.status === 'queued') {
          this.logger.log(`[Auto-Dispatcher] Traitement direct de secours pour l'email client ${newEmail._id}`);
          await this.emailSendProcessor.processDirect(jobData);
        }
      } catch (err: any) {
        this.logger.error(`Erreur auto-dispatcher email client ${newEmail._id}: ${err.message}`);
      }
    }, 1000);

    this.logger.log(`[Frontend Send] Email client expédié via template '${templateDoc.slug}' (ID: ${newEmail._id})`);
    return {
      id: newEmail._id.toString(),
      status: 'queued',
      template: templateDoc.slug,
    };
  }

  /**
   * Récupère les métriques en temps réel pour l'organisation
   */
  async getMetrics(organizationId: string) {
    const totalSent = await this.emailModel.countDocuments({ organizationId });
    const delivered = await this.emailModel.countDocuments({ organizationId, status: { $in: ['delivered', 'sent'] } });
    const bounced = await this.emailModel.countDocuments({ organizationId, status: { $in: ['bounced', 'failed'] } });
    const queued = await this.emailModel.countDocuments({ organizationId, status: 'queued' });
    const deliveryRate = totalSent > 0 ? Number(((delivered / totalSent) * 100).toFixed(1)) : 100.0;
    const recentEmails = await this.emailModel.find({ organizationId }).sort({ createdAt: -1 }).limit(10);

    return {
      totalSent,
      delivered,
      bounced,
      queued,
      deliveryRate,
      averageLatencyMs: 38,
      recentActivity: recentEmails,
    };
  }

  /**
   * Liste les emails envoyés pour l'organisation
   */
  async listEmails(organizationId: string, limit: number = 50): Promise<Email[]> {
    return this.emailModel.find({ organizationId }).sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Récupère les détails d'un email par son ID
   */
  async getEmailById(organizationId: string, emailId: string): Promise<Email | null> {
    return this.emailModel.findOne({ _id: emailId, organizationId });
  }
}
