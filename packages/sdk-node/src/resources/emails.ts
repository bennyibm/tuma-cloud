import { SendEmailOptions, SendEmailResponse, EmailResponse } from '../interfaces';

export class Emails {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async send(options: SendEmailOptions): Promise<{ data: SendEmailResponse | null; error: Error | null }> {
    try {
      const to = Array.isArray(options.to) ? options.to : [options.to];
      const cc = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
      const bcc = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;

      const payload = {
        from: options.from,
        to,
        cc,
        bcc,
        reply_to: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        template: options.template,
        variables: options.variables,
        attachments: options.attachments,
        tags: options.tags,
      };

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Tuma-NodeSDK/1.0',
      };

      if (options.idempotencyKey) {
        headers['Idempotency-Key'] = options.idempotencyKey;
      }

      const response = await fetch(`${this.baseUrl}/v1/emails`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        return { data: null, error: new Error(json.message || json.detail || 'Failed to send email') };
      }

      return { data: json as SendEmailResponse, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async get(id: string): Promise<{ data: EmailResponse | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/emails/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Tuma-NodeSDK/1.0',
        },
      });

      const json = await response.json();

      if (!response.ok) {
        return { data: null, error: new Error(json.message || 'Failed to fetch email') };
      }

      return { data: json as EmailResponse, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}
