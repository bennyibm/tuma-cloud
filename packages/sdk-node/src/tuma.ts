import { TumaOptions } from './interfaces';
import { Emails } from './resources/emails';
import { Domains } from './resources/domains';
import { Webhooks } from './resources/webhooks';

export class Tuma {
  public readonly emails: Emails;
  public readonly domains: Domains;
  public readonly webhooks: Webhooks;

  constructor(options: string | TumaOptions) {
    const apiKey = typeof options === 'string' ? options : options.apiKey;
    const baseUrl = typeof options === 'object' && options.baseUrl ? options.baseUrl : 'http://localhost:3001';

    if (!apiKey) {
      throw new Error("Missing API Key. Provide a valid 'sk_live_...' secret key.");
    }

    this.emails = new Emails(apiKey, baseUrl);
    this.domains = new Domains(apiKey, baseUrl);
    this.webhooks = new Webhooks(apiKey, baseUrl);
  }
}
