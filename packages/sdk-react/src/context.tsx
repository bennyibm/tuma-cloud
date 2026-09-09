import React, { createContext, useContext } from 'react';
import { TumaConfig } from './types';

export const DEFAULT_BASE_URL = 'https://api.tuma.eldnet.tech';

const TumaContext = createContext<TumaConfig | null>(null);

export interface TumaProviderProps extends TumaConfig {
  children: React.ReactNode;
}

/**
 * TumaProvider enables root-level configuration of credentials and defaults for @tuma/react hooks and components.
 *
 * @example
 * ```tsx
 * <TumaProvider publicKey="pk_live_..." defaultRecipient="contact@mycompany.com">
 *   <App />
 * </TumaProvider>
 * ```
 */
export const TumaProvider: React.FC<TumaProviderProps> = ({
  children,
  publicKey,
  baseUrl = DEFAULT_BASE_URL,
  defaultRecipient,
  defaultTemplate = 'contact-form',
}) => {
  return (
    <TumaContext.Provider
      value={{
        publicKey,
        baseUrl: baseUrl.replace(/\/+$/, ''),
        defaultRecipient,
        defaultTemplate,
      }}
    >
      {children}
    </TumaContext.Provider>
  );
};

/**
 * Hook to access TumaContext configuration
 */
export const useTumaContext = (): TumaConfig => {
  const context = useContext(TumaContext);
  return context || { baseUrl: DEFAULT_BASE_URL, defaultTemplate: 'contact-form' };
};
