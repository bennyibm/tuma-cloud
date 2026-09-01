export interface TumaOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface SendEmailOptions {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
  tags?: Array<{ name: string; value: string }>;
  idempotencyKey?: string;
}

export interface SendEmailResponse {
  id: string;
  from: string;
  to: string[];
  status: string;
  createdAt: string;
}

export interface EmailResponse {
  _id: string;
  from: string;
  to: string[];
  subject: string;
  status: string;
  tracking: {
    opens: number;
    clicks: number;
    firstOpenedAt?: string;
    lastClickedAt?: string;
  };
  createdAt: string;
}

export interface CreateDomainOptions {
  name: string;
}

export interface DomainResponse {
  _id: string;
  name: string;
  status: string;
  dkim: {
    selector: string;
    publicKey: string;
    host: string;
    value: string;
    status: string;
  };
  spf: {
    host: string;
    value: string;
    status: string;
  };
  dmarc: {
    host: string;
    value: string;
    status: string;
  };
  verifiedAt?: string;
  createdAt: string;
}

export interface CreateWebhookOptions {
  url: string;
  description?: string;
  events?: string[];
}

export interface WebhookResponse {
  _id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  description: string;
  createdAt: string;
}
