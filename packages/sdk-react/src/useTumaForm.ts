import React, { useRef } from 'react';
import { useTuma } from './useTuma';
import { UseTumaFormOptions, UseTumaFormReturn } from './types';

/**
 * Convenient React hook that binds TUMA directly to native HTML <form> elements.
 * Automatically serializes inputs, manages submit state, and provides built-in honeypot bot trap.
 *
 * @example
 * ```tsx
 * const { formProps, honeypotProps, isSubmitting, isSuccess } = useTumaForm({
 *   template: 'contact-form',
 *   recipientEmail: 'hello@mysite.com',
 * });
 *
 * return (
 *   <form {...formProps}>
 *     <input {...honeypotProps} />
 *     <input name="clientName" required />
 *     <input name="clientEmail" type="email" required />
 *     <textarea name="clientMessage" required />
 *     <button type="submit" disabled={isSubmitting}>Envoyer</button>
 *     {isSuccess && <p>Message envoyé !</p>}
 *   </form>
 * );
 * ```
 */
export function useTumaForm(options: UseTumaFormOptions = {}): UseTumaFormReturn {
  const formRef = useRef<HTMLFormElement>(null);
  const resetOnSuccess = options.resetOnSuccess !== false;

  const tuma = useTuma({
    ...options,
    onSuccess: (data) => {
      if (resetOnSuccess && formRef.current) {
        formRef.current.reset();
      }
      options.onSuccess?.(data);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;

    const formData = new FormData(formElement);
    const variables: Record<string, any> = {};
    let honeypotValue: string | undefined = undefined;

    formData.forEach((value, key) => {
      if (key === '_honeypot') {
        honeypotValue = value.toString();
      } else {
        variables[key] = value.toString();
      }
    });

    await tuma.send(variables, {
      _honeypot: honeypotValue,
    });
  };

  return {
    ...tuma,
    formProps: {
      onSubmit: handleSubmit,
      ref: formRef,
    },
    honeypotProps: {
      name: '_honeypot',
      style: {
        opacity: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        height: 0,
        width: 0,
        zIndex: -1,
        pointerEvents: 'none',
      },
      tabIndex: -1,
      autoComplete: 'off',
      'aria-hidden': true,
    },
  };
}
