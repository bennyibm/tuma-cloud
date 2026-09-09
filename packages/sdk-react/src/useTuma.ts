import { useState, useCallback } from 'react';
import { useTumaContext, DEFAULT_BASE_URL } from './context';
import {
  UseTumaOptions,
  UseTumaReturn,
  SendEmailOptions,
  SendEmailResponse,
} from './types';

/**
 * Primary React hook for triggering asynchronous transactional email transmissions via TUMA Cloud.
 *
 * @example
 * ```tsx
 * const { send, isSubmitting, isSuccess } = useTuma({
 *   template: 'contact-form',
 *   recipientEmail: 'support@mybrand.com',
 * });
 *
 * const handleSubmit = async () => {
 *   await send({ clientName: 'Alice', clientEmail: 'alice@example.com', clientMessage: 'Hello!' });
 * };
 * ```
 */
export function useTuma(options: UseTumaOptions = {}): UseTumaReturn {
  const context = useTumaContext();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SendEmailResponse | null>(null);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
    setData(null);
  }, []);

  const send = useCallback(
    async (
      variables: Record<string, any>,
      sendOptions?: Partial<SendEmailOptions>,
    ): Promise<SendEmailResponse> => {
      const activePublicKey =
        sendOptions?.publicKey || options.publicKey || context.publicKey;

      if (!activePublicKey) {
        const missingKeyErr = new Error(
          "TUMA: Missing Public Key. Provide 'publicKey' via TumaProvider or inside useTuma({ publicKey: 'pk_live_...' }).",
        );
        setIsError(true);
        setError(missingKeyErr);
        options.onError?.(missingKeyErr);
        throw missingKeyErr;
      }

      const activeTemplate =
        sendOptions?.template ||
        options.template ||
        context.defaultTemplate ||
        'contact-form';

      const activeRecipient =
        sendOptions?.recipientEmail ||
        options.recipientEmail ||
        context.defaultRecipient;

      const activeBaseUrl = (
        sendOptions?.publicKey
          ? DEFAULT_BASE_URL
          : options.baseUrl || context.baseUrl || DEFAULT_BASE_URL
      ).replace(/\/+$/, '');

      setIsSubmitting(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);

      try {
        const payload: Record<string, any> = {
          publicKey: activePublicKey,
          template: activeTemplate,
          variables,
        };

        if (activeRecipient) {
          payload.recipientEmail = activeRecipient;
        }

        if (sendOptions?._honeypot) {
          payload._honeypot = sendOptions._honeypot;
        }

        const response = await fetch(`${activeBaseUrl}/v1/client/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Tuma-ReactSDK/1.0',
          },
          body: JSON.stringify(payload),
        });

        const json = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errorMessage =
            json.detail ||
            json.message ||
            (Array.isArray(json.message) ? json.message.join(', ') : null) ||
            `TUMA API Request failed with HTTP ${response.status}`;
          throw new Error(errorMessage);
        }

        const result: SendEmailResponse = {
          id: json.id || json.messageId || 'unknown',
          status: json.status || 'queued',
          template: json.template || activeTemplate,
        };

        setData(result);
        setIsSuccess(true);
        setIsSubmitting(false);

        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        setError(errObj);
        setIsError(true);
        setIsSubmitting(false);

        options.onError?.(errObj);
        throw errObj;
      }
    },
    [options, context],
  );

  return {
    send,
    isSubmitting,
    isSuccess,
    isError,
    error,
    data,
    reset,
  };
}
