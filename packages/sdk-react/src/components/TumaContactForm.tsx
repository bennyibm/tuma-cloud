import React from 'react';
import { useTumaForm } from '../useTumaForm';
import { TumaContactFormProps } from '../types';

/**
 * Drop-in, production-ready Contact Form component for React & Next.js applications.
 * Features built-in honeypot bot prevention, state management, and adaptive styling themes.
 *
 * @example
 * ```tsx
 * <TumaContactForm
 *   publicKey="pk_live_..."
 *   recipientEmail="support@eldnet.tech"
 *   theme="dark"
 * />
 * ```
 */
export const TumaContactForm: React.FC<TumaContactFormProps> = ({
  publicKey,
  template = 'contact-form',
  recipientEmail,
  baseUrl,
  theme = 'dark',
  title = 'Contactez-nous',
  subtitle = 'Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.',
  nameLabel = 'Votre Nom',
  emailLabel = 'Adresse Email',
  messageLabel = 'Votre Message',
  submitLabel = 'Envoyer le Message',
  submittingLabel = 'Envoi en cours...',
  successMessage = 'Votre message a bien été envoyé. Nous vous répondrons rapidement !',
  errorMessage,
  className = '',
  onSuccess,
  onError,
}) => {
  const { formProps, honeypotProps, isSubmitting, isSuccess, isError, error, reset } =
    useTumaForm({
      publicKey,
      template,
      recipientEmail,
      baseUrl,
      onSuccess,
      onError,
    });

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  // Base container styles
  const containerStyle: React.CSSProperties = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    maxWidth: '540px',
    width: '100%',
    padding: theme === 'minimal' ? '0' : '28px',
    borderRadius: theme === 'minimal' ? '0' : '16px',
    backgroundColor: isDark ? '#0B0F19' : isLight ? '#FFFFFF' : 'transparent',
    color: isDark ? '#F9FAFB' : '#111827',
    border: isDark ? '1px solid #1F2937' : isLight ? '1px solid #E5E7EB' : 'none',
    boxShadow:
      isDark
        ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
        : isLight
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)'
        : 'none',
    boxSizing: 'border-box',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: isDark ? '1px solid #374151' : '1px solid #D1D5DB',
    backgroundColor: isDark ? '#111827' : '#F9FAFB',
    color: isDark ? '#FFFFFF' : '#111827',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: isDark ? '#9CA3AF' : '#4B5563',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isSubmitting ? '#059669' : '#10B981',
    color: '#000000',
    fontWeight: 700,
    fontSize: '14px',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.15s ease, transform 0.05s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  return (
    <div style={containerStyle} className={`tuma-contact-form ${className}`}>
      {/* Title & Subtitle */}
      {title && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700 }}>
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: isDark ? '#9CA3AF' : '#6B7280',
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Success Notification */}
      {isSuccess ? (
        <div
          style={{
            padding: '18px',
            borderRadius: '10px',
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: isDark ? '#6EE7B7' : '#065F46',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              marginBottom: '8px',
            }}
          >
            ✓
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
            {successMessage}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '6px',
              border: isDark ? '1px solid #374151' : '1px solid #D1D5DB',
              backgroundColor: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form {...formProps} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Bot-blocking honeypot */}
          <input {...honeypotProps} />

          {/* Error Message */}
          {isError && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: isDark ? '#FCA5A5' : '#991B1B',
                fontSize: '13px',
              }}
            >
              ⚠ {errorMessage || error?.message || "Une erreur est survenue lors de l'envoi."}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="tuma_clientName" style={labelStyle}>
              {nameLabel}
            </label>
            <input
              id="tuma_clientName"
              name="clientName"
              type="text"
              required
              placeholder="Ex: Sarah Kimpa"
              style={inputStyle}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="tuma_clientEmail" style={labelStyle}>
              {emailLabel}
            </label>
            <input
              id="tuma_clientEmail"
              name="clientEmail"
              type="email"
              required
              placeholder="Ex: sarah@entreprise.cd"
              style={inputStyle}
            />
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="tuma_clientMessage" style={labelStyle}>
              {messageLabel}
            </label>
            <textarea
              id="tuma_clientMessage"
              name="clientMessage"
              rows={4}
              required
              placeholder="Votre message ici..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting} style={buttonStyle}>
            {isSubmitting ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(0,0,0,0.3)',
                    borderTopColor: '#000000',
                    borderRadius: '50%',
                    animation: 'tuma-spin 0.6s linear infinite',
                  }}
                />
                <span>{submittingLabel}</span>
              </>
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        </form>
      )}

      {/* Powered by TUMA footer badge */}
      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '11px',
          color: isDark ? '#6B7280' : '#9CA3AF',
        }}
      >
        Délivré par{' '}
        <a
          href="https://tuma.eldnet.tech"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#10B981',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          tuma
        </a>
      </div>
    </div>
  );
};
