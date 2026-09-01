import { CreateDomainOptions, DomainResponse } from '../interfaces';

export class Domains {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  async create(options: CreateDomainOptions): Promise<{ data: DomainResponse | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Tuma-NodeSDK/1.0',
        },
        body: JSON.stringify(options),
      });

      const json = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(json.message || 'Failed to create domain') };
      }
      return { data: json as DomainResponse, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async list(): Promise<{ data: DomainResponse[] | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/domains`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Tuma-NodeSDK/1.0',
        },
      });

      const json = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(json.message || 'Failed to list domains') };
      }
      return { data: json as DomainResponse[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }

  async verify(id: string): Promise<{ data: DomainResponse | null; error: Error | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/domains/${id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Tuma-NodeSDK/1.0',
        },
      });

      const json = await response.json();
      if (!response.ok) {
        return { data: null, error: new Error(json.message || 'Failed to verify domain') };
      }
      return { data: json as DomainResponse, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}
