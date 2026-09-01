import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WebhooksService, WebhookDispatchJobData } from './webhooks.service';

@Processor('webhook-dispatch-queue')
export class WebhookDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDispatchProcessor.name);

  constructor(private readonly webhooksService: WebhooksService) {
    super();
  }

  async process(job: Job<WebhookDispatchJobData>): Promise<any> {
    this.logger.log(`[Webhook Worker] Traitement du webhook job ${job.id} pour ${job.data.url}`);
    return this.webhooksService.dispatchWebhookHttp(job.data);
  }
}
