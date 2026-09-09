const normalizeApiBase = (): string => {
  let url = ((import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/v1').trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/v1')) {
    url = `${url}/v1`;
  }
  return url;
};

export const API_BASE = normalizeApiBase();

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('tuma_auth_token');
  const authVal = token ? `Bearer ${token}` : 'Bearer sk_live_test123456789';
  return {
    'Authorization': authVal,
    'Content-Type': 'application/json',
  };
};

export interface EmailRecord {
  _id: string;
  from: string;
  to: string[];
  subject: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  tracking: {
    opens: number;
    clicks: number;
    firstOpenedAt?: string;
    lastClickedAt?: string;
  };
  providerMessageId?: string;
  variables?: Record<string, any>;
  tags?: Array<{ name: string; value: string }>;
  html?: string;
  createdAt: string;
}

export interface MetricsRecord {
  totalSent: number;
  delivered: number;
  bounced: number;
  queued: number;
  deliveryRate: number;
  averageLatencyMs: number;
  recentActivity: EmailRecord[];
}

export interface DomainRecord {
  _id: string;
  name: string;
  status: 'pending' | 'verified' | 'failed';
  dkim: { host: string; value: string; status: string; selector: string };
  spf: { host: string; value: string; status: string };
  dmarc: { host: string; value: string; status: string };
  verifiedAt?: string;
  createdAt: string;
}

export interface WebhookRecord {
  _id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  description: string;
  createdAt: string;
}

export interface WebhookDeliveryRecord {
  _id: string;
  webhookId: string;
  eventType: string;
  status: 'success' | 'failed';
  httpStatusCode: number;
  latencyMs: number;
  responseBody: string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface SuppressionRecord {
  _id: string;
  email: string;
  reason: 'hard_bounce' | 'spam_complaint' | 'unsubscribe' | 'manual_block';
  createdAt: string;
}

export const api = {
  // Metrics en direct
  async getMetrics(): Promise<MetricsRecord> {
    try {
      const res = await fetch(`${API_BASE}/emails/metrics`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    } catch {
      return {
        totalSent: 0,
        delivered: 0,
        bounced: 0,
        queued: 0,
        deliveryRate: 100,
        averageLatencyMs: 38,
        recentActivity: [],
      };
    }
  },

  // Emails
  async getEmails(): Promise<EmailRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/emails`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch emails');
      return await res.json();
    } catch {
      return [];
    }
  },

  async sendEmail(payload: any, idempotencyKey?: string) {
    const customHeaders = getAuthHeaders();
    if (idempotencyKey) customHeaders['Idempotency-Key'] = idempotencyKey;
    const res = await fetch(`${API_BASE}/emails`, {
      method: 'POST',
      headers: customHeaders,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Send error');
    return data;
  },

  // Domains
  async getDomains(): Promise<DomainRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/domains`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch domains');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createDomain(name: string): Promise<DomainRecord> {
    const res = await fetch(`${API_BASE}/domains`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Create domain error');
    return data;
  },

  async verifyDomain(id: string): Promise<DomainRecord> {
    const res = await fetch(`${API_BASE}/domains/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Verify domain error');
    return data;
  },

  // Webhooks
  async getWebhooks(): Promise<WebhookRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/webhooks`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      return await res.json();
    } catch {
      return [];
    }
  },

  async createWebhook(url: string, events: string[], description: string): Promise<WebhookRecord> {
    const res = await fetch(`${API_BASE}/webhooks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url, events, description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Create webhook error');
    return data;
  },

  async getWebhookDeliveries(): Promise<WebhookDeliveryRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/webhooks/deliveries`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch deliveries');
      return await res.json();
    } catch {
      return [];
    }
  },

  // Suppressions
  async getSuppressions(): Promise<SuppressionRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/suppressions`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch suppressions');
      return await res.json();
    } catch {
      return [];
    }
  },

  async addSuppression(email: string, reason: string): Promise<SuppressionRecord> {
    const res = await fetch(`${API_BASE}/suppressions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Add suppression error');
    return data;
  },

  async removeSuppression(id: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE}/suppressions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Remove suppression error');
    return data;
  },

  async deleteDomain(id: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE}/domains/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete domain error');
    return data;
  },

  async deleteWebhook(id: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE}/webhooks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete webhook error');
    return data;
  },

  // Templates
  async getTemplates() {
    try {
      const res = await fetch(`${API_BASE}/templates`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async deleteTemplate(slug: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE}/templates/${slug}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete template error');
    return data;
  },

  // API Keys (MongoDB Live Backend)
  async getApiKeys() {
    try {
      const res = await fetch(`${API_BASE}/api-keys`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createApiKey(name: string, type: 'secret' | 'public', ipWhitelist?: string, scopes?: string[]) {
    const res = await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, type, ipWhitelist, scopes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Create API key error');
    return data;
  },

  async deleteApiKey(id: string) {
    const res = await fetch(`${API_BASE}/api-keys/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Delete API key error');
    return data;
  },
};
