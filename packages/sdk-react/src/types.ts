import React from 'react';

export interface TumaConfig {
  /**
   * Public API Key (format: pk_live_... or pk_test_...)
   */
  publicKey?: string;

  /**
   * Base URL of the TUMA API (default: https://api.tuma.eldnet.tech)
   */
  baseUrl?: string;

  /**
   * Default recipient email address for contact form submissions
   */
  defaultRecipient?: string;

  /**
   * Default template slug or ID (default: 'contact-form')
   */
  defaultTemplate?: string;
}

export interface SendEmailOptions {
  /**
   * Template slug (ex: 'contact-form') or Template ID
   */
  template?: string;

  /**
   * Dynamic variables matching your template placeholders
   */
  variables: Record<string, any>;

  /**
   * Recipient email address
   */
  recipientEmail?: string;

  /**
   * Public API Key override
   */
  publicKey?: string;

  /**
   * Optional honeypot spam protection field value
   */
  _honeypot?: string;
}

export interface SendEmailResponse {
  id: string;
  status: string;
  template: string;
}

export interface UseTumaOptions {
  /**
   * Public API Key (if not provided via TumaProvider)
   */
  publicKey?: string;

  /**
   * Default template slug (default: 'contact-form')
   */
  template?: string;

  /**
   * Destination email for notifications
   */
  recipientEmail?: string;

  /**
   * TUMA API base URL override
   */
  baseUrl?: string;

  /**
   * Callback invoked on successful send
   */
  onSuccess?: (data: SendEmailResponse) => void;

  /**
   * Callback invoked on send failure
   */
  onError?: (error: Error) => void;
}

export interface UseTumaReturn {
  /**
   * Send function that accepts variables and triggers the email transmission
   */
  send: (
    variables: Record<string, any>,
    options?: Partial<SendEmailOptions>,
  ) => Promise<SendEmailResponse>;

  /**
   * True while the HTTP request is pending
   */
  isSubmitting: boolean;

  /**
   * True if the last submission succeeded
   */
  isSuccess: boolean;

  /**
   * True if the last submission failed
   */
  isError: boolean;

  /**
   * Error object if the last submission failed
   */
  error: Error | null;

  /**
   * Response data from TUMA API
   */
  data: SendEmailResponse | null;

  /**
   * Reset submission state back to idle
   */
  reset: () => void;
}

export interface UseTumaFormOptions extends UseTumaOptions {
  /**
   * Automatically reset the form fields when submission succeeds (default: true)
   */
  resetOnSuccess?: boolean;
}

export interface UseTumaFormReturn extends UseTumaReturn {
  /**
   * Properties to spread onto your HTML <form> element
   */
  formProps: {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    ref: React.RefObject<HTMLFormElement>;
  };

  /**
   * Properties to spread onto an invisible honeypot anti-spam input
   */
  honeypotProps: {
    name: string;
    style: React.CSSProperties;
    tabIndex: number;
    autoComplete: string;
    'aria-hidden': boolean;
  };
}

export interface TumaContactFormProps {
  publicKey?: string;
  template?: string;
  recipientEmail?: string;
  baseUrl?: string;
  theme?: 'dark' | 'light' | 'minimal';
  title?: string;
  subtitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  onSuccess?: (data: SendEmailResponse) => void;
  onError?: (error: Error) => void;
}

export interface ServerSendEmailOptions {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface ServerClientOptions {
  /**
   * Secret API Key (format: tuma_live_... or tuma_test_...)
   */
  apiKey: string;

  /**
   * TUMA API base URL (default: https://api.tuma.eldnet.tech)
   */
  baseUrl?: string;
}
