import { CreateWebhookOptions, WebhookResponse } from '../interfaces';
import * as crypto from 'crypto';

export class Webhooks {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async create(options: CreateWebhookOptions): Promise<{ data: WebhookResponse | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Tuma-NodeSDK/1.0',
        },
        body: JSON.stringify(options),
      });

      const json = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(json.message || 'Failed to create webhook') };
      }
      return { data: json as WebhookResponse, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async list(): Promise<{ data: WebhookResponse[] | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/webhooks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Tuma-NodeSDK/1.0',
        },
      });

      const json = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(json.message || 'Failed to list webhooks') };
      }
      return { data: json as WebhookResponse[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  /**
   * Vérifie la signature cryptographique d'un webhook entrant
   */
  verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    try {
      // signatureHeader format: 't=1724750400,v1=9a8b7c6d...'
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const signaturePart = parts.find((p) => p.startsWith('v1='));

      if (!timestampPart || !signaturePart) return false;

      const timestamp = timestampPart.substring(2);
      const signature = signaturePart.substring(3);

      // Tolérance temporelle anti-rejeu : 5 minutes (300 secondes)
      const now = Math.floor(Date.now() / 1000);
      const eventTime = parseInt(timestamp, 10);
      if (Math.abs(now - eventTime) > 300) {
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }
}
