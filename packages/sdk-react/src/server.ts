import { ServerClientOptions, ServerSendEmailOptions } from './types';

const DEFAULT_SERVER_BASE_URL = 'https://api.tuma.eldnet.tech';

/**
 * Server-side client for Next.js App Router (Server Actions / Route Handlers) and Node.js backends.
 *
 * @example
 * ```typescript
 * import { createTumaServerClient } from '@tuma/react/server';
 *
 * const tuma = createTumaServerClient({ apiKey: process.env.TUMA_API_KEY! });
 *
 * export async function sendNotificationAction(formData: FormData) {
 *   'use server';
 *   await tuma.sendEmail({
 *     to: 'contact@eldnet.tech',
 *     from: 'Notifications <notifications@mydomain.com>',
 *     subject: 'Nouveau contact',
 *     html: '<p>Message reçu !</p>'
 *   });
 * }
 * ```
 */
export class TumaServerClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: ServerClientOptions) {
    if (!options.apiKey) {
      throw new Error(
        "TUMA Server Client: Missing API Key. Provide a secret key starting with 'tuma_live_' or 'tuma_test_'.",
      );
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || DEFAULT_SERVER_BASE_URL).replace(/\/+$/, '');
  }

  /**
   * Send a transactional email via TUMA Cloud
   */
  async sendEmail(
    options: ServerSendEmailOptions,
  ): Promise<{ id: string; status: string }> {
    const toArray = Array.isArray(options.to) ? options.to : [options.to];

    const response = await fetch(`${this.baseUrl}/v1/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'User-Agent': 'Tuma-ReactSDK-Server/1.0',
      },
      body: JSON.stringify({
        to: toArray,
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text,
        template: options.template,
        variables: options.variables,
        replyTo: options.replyTo,
        tags: options.tags,
      }),
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        json.detail ||
        json.message ||
        (Array.isArray(json.message) ? json.message.join(', ') : null) ||
        `TUMA Server send failed with HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      id: json.id || json.messageId || 'unknown',
      status: json.status || 'queued',
    };
  }
}

/**
 * Factory function to initialize a TumaServerClient
 */
export function createTumaServerClient(
  options: ServerClientOptions,
): TumaServerClient {
  return new TumaServerClient(options);
}

/**
 * Direct standalone helper function to send an email with minimal setup
 */
export async function sendTumaEmail(
  options: ServerSendEmailOptions & { apiKey: string; baseUrl?: string },
): Promise<{ id: string; status: string }> {
  const client = new TumaServerClient({
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
  });
  return client.sendEmail(options);
}

/**
 * Pre-built Next.js App Router Route Handler for /api/contact/route.ts
 *
 * @example
 * ```typescript
 * // app/api/contact/route.ts
 * import { tumaContactRouteHandler } from '@tuma/react/server';
 *
 * export const POST = tumaContactRouteHandler({
 *   apiKey: process.env.TUMA_API_KEY!,
 *   recipientEmail: 'support@mycompany.com',
 * });
 * ```
 */
export function tumaContactRouteHandler(config: {
  apiKey: string;
  recipientEmail: string;
  senderEmail?: string;
  baseUrl?: string;
}) {
  return async function handleContactRequest(req: Request) {
    try {
      const body = await req.json();
      const { clientName, clientEmail, clientMessage, _honeypot } = body;

      // Silent spam prevention
      if (_honeypot && String(_honeypot).trim().length > 0) {
        return new Response(JSON.stringify({ error: 'Spam detected' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!clientEmail || !clientMessage) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields (email or message)' }),
          {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      const client = new TumaServerClient({
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      });

      const sender = config.senderEmail || 'Contact <contact@tuma.dev>';
      const subject = `Nouveau message de contact : ${clientName || clientEmail}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
          <h2 style="color: #10B981; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
            Nouveau message de contact
          </h2>
          <p><strong>Nom :</strong> ${clientName || 'Non spécifié'}</p>
          <p><strong>Email :</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
          <p><strong>Message :</strong></p>
          <blockquote style="background: #F9FAFB; padding: 14px; border-left: 4px solid #10B981; margin: 12px 0;">
            ${String(clientMessage).replace(/\n/g, '<br />')}
          </blockquote>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin-top: 24px;" />
          <p style="font-size: 11px; color: #9CA3AF;">Délivré par TUMA Cloud — Sub-38ms Edge Ingestion</p>
        </div>
      `;

      const result = await client.sendEmail({
        to: config.recipientEmail,
        from: sender,
        replyTo: clientEmail,
        subject,
        html,
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || 'Internal Server Error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  };
}
