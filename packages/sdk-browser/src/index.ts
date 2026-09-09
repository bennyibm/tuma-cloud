export interface TumaBrowserOptions {
  publicKey: string;
  baseUrl?: string;
}

export interface ClientSendResponse {
  id: string;
  status: string;
  template: string;
}

class TumaBrowserClient {
  private publicKey: string = '';
  private baseUrl: string = 'https://api.tuma.eldnet.tech';

  /**
   * Initialise le client Browser avec la clé publique du projet
   */
  init(publicKey: string, options?: { baseUrl?: string }): void {
    this.publicKey = publicKey;
    if (options?.baseUrl) {
      this.baseUrl = options.baseUrl;
    }
  }

  /**
   * Envoie un email directement depuis le frontend via un template enregistré
   */
  async send(
    template: string,
    variables: Record<string, any>,
    publicKeyOverride?: string,
  ): Promise<{ data: ClientSendResponse | null; error: Error | null }> {
    const key = publicKeyOverride || this.publicKey;
    if (!key) {
      return {
        data: null,
        error: new Error("Missing Public Key. Call tuma.init('pk_live_...') first or pass publicKey as argument."),
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/client/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Tuma-BrowserSDK/1.0',
        },
        body: JSON.stringify({
          publicKey: key,
          template,
          variables,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        return { data: null, error: new Error(json.message || json.detail || 'Failed to send client email') };
      }

      return { data: json as ClientSendResponse, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  /**
   * Envoie automatiquement les données saisies dans un formulaire HTML
   */
  async sendForm(
    template: string,
    formElementOrSelector: HTMLFormElement | string,
    publicKeyOverride?: string,
  ): Promise<{ data: ClientSendResponse | null; error: Error | null }> {
    const form =
      typeof formElementOrSelector === 'string'
        ? (document.querySelector(formElementOrSelector) as HTMLFormElement)
        : formElementOrSelector;

    if (!form || !(form instanceof HTMLFormElement)) {
      return { data: null, error: new Error('Invalid form element or selector provided.') };
    }

    const formData = new FormData(form);
    const variables: Record<string, any> = {};

    formData.forEach((value, key) => {
      variables[key] = value.toString();
    });

    return this.send(template, variables, publicKeyOverride);
  }
}

export const tuma = new TumaBrowserClient();
export default tuma;
