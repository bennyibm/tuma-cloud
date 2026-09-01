export interface SendMailOptions {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface SendMailResult {
  providerMessageId: string;
  provider: 'mailpit' | 'aws_ses' | 'smtp_relay';
  rawResponse?: any;
}

export interface ITransporter {
  send(options: SendMailOptions): Promise<SendMailResult>;
  verify(): Promise<boolean>;
}
