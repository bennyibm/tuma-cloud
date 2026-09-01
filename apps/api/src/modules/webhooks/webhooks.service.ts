import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { Webhook, WebhookDocument } from '../../schemas/webhook.schema';
import { WebhookDelivery, WebhookDeliveryDocument } from '../../schemas/webhook-delivery.schema';
import { CreateWebhookDto } from './dto/create-webhook.dto';

export interface WebhookDispatchJobData {
  webhookId: string;
  organizationId: string;
  url: string;
  secret: string;
  eventType: string;
  payload: Record<string, any>;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(Webhook.name) private readonly webhookModel: Model<WebhookDocument>,
    @InjectModel(WebhookDelivery.name) private readonly deliveryModel: Model<WebhookDeliveryDocument>,
    @InjectQueue('webhook-dispatch-queue') private readonly webhookQueue: Queue<WebhookDispatchJobData>,
  ) {}

  /**
   * Crée un nouveau endpoint de webhook pour une organisation
   */
  async createWebhook(organizationId: string, dto: CreateWebhookDto): Promise<Webhook> {
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const defaultEvents = ['email.sent', 'email.delivered', 'email.opened', 'email.clicked', 'email.bounced'];

    const webhook = await this.webhookModel.create({
      organizationId,
      url: dto.url,
      secret,
      events: dto.events && dto.events.length > 0 ? dto.events : defaultEvents,
      description: dto.description || '',
      isActive: true,
    });

    this.logger.log(`Webhook créé avec succès pour l'URL ${dto.url} (ID: ${webhook._id})`);
    return webhook;
  }

  /**
   * Liste les webhooks d'une organisation
   */
  async listWebhooks(organizationId: string): Promise<Webhook[]> {
    return this.webhookModel.find({ organizationId }).sort({ createdAt: -1 });
  }

  /**
   * Récupère un webhook par son ID
   */
  async getWebhook(organizationId: string, webhookId: string): Promise<Webhook> {
    const webhook = await this.webhookModel.findOne({ _id: webhookId, organizationId });
    if (!webhook) throw new NotFoundException('Webhook not found.');
    return webhook;
  }

  /**
   * Supprime un webhook
   */
  async deleteWebhook(organizationId: string, webhookId: string): Promise<{ deleted: boolean }> {
    const res = await this.webhookModel.deleteOne({ _id: webhookId, organizationId });
    if (res.deletedCount === 0) throw new NotFoundException('Webhook not found.');
    return { deleted: true };
  }

  /**
   * Déclenche un événement pour tous les webhooks abonnés de l'organisation
   */
  async triggerEvent(
    organizationId: string,
    eventType: string,
    data: Record<string, any>,
  ): Promise<void> {
    const activeWebhooks = await this.webhookModel.find({
      organizationId,
      isActive: true,
      events: eventType,
    });

    if (!activeWebhooks || activeWebhooks.length === 0) return;

    for (const webhook of activeWebhooks) {
      const payload = {
        id: `evt_${crypto.randomBytes(16).toString('hex')}`,
        type: eventType,
        created_at: new Date().toISOString(),
        data,
      };

      await this.webhookQueue.add(
        'dispatch-webhook-job',
        {
          webhookId: webhook._id.toString(),
          organizationId,
          url: webhook.url,
          secret: webhook.secret,
          eventType,
          payload,
        },
        {
          attempts: 5,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: true,
        },
      );
    }
  }

  /**
   * Expédie la requête HTTP POST signée par HMAC-SHA256 vers le serveur client
   */
  async dispatchWebhookHttp(jobData: WebhookDispatchJobData): Promise<any> {
    const { webhookId, organizationId, url, secret, eventType, payload } = jobData;
    const startTime = Date.now();

    const timestamp = Math.floor(Date.now() / 1000);
    const rawBody = JSON.stringify(payload);

    // Calcul de la signature cryptographique : HMAC-SHA256(secret, timestamp + "." + rawBody)
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const signatureHeader = `t=${timestamp},v1=${signature}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Tuma-Webhooks/1.0',
          'Resend-Signature': signatureHeader,
          'Tuma-Signature': signatureHeader,
        },
        body: rawBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const responseText = await response.text().catch(() => '');

      const isSuccess = response.status >= 200 && response.status < 300;

      await this.deliveryModel.create({
        webhookId,
        organizationId,
        eventType,
        status: isSuccess ? 'success' : 'failed',
        httpStatusCode: response.status,
        responseBody: responseText.substring(0, 1000),
        latencyMs,
        payload,
      });

      if (!isSuccess) {
        throw new Error(`Webhook client returned HTTP status ${response.status}`);
      }

      this.logger.log(`[Webhook] Dispatch réussi vers ${url} (${response.status} en ${latencyMs}ms)`);
      return { success: true, status: response.status };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      this.logger.warn(`[Webhook] Échec du dispatch vers ${url}: ${error.message}`);

      await this.deliveryModel.create({
        webhookId,
        organizationId,
        eventType,
        status: 'failed',
        httpStatusCode: error.status || 0,
        responseBody: error.message,
        latencyMs,
        payload,
      });

      throw error;
    }
  }

  /**
   * Liste l'historique des livraisons de webhooks
   */
  async listDeliveries(organizationId: string, webhookId?: string): Promise<WebhookDelivery[]> {
    const filter: Record<string, any> = { organizationId };
    if (webhookId) filter.webhookId = webhookId;
    return this.deliveryModel.find(filter).sort({ createdAt: -1 }).limit(50);
  }
}
