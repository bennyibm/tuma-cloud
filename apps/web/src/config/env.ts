// Configuration des variables d'environnement pour apps/web
const normalizeUrl = (raw: string | undefined, defaultVal: string, ensureV1 = false): string => {
  let url = (raw || defaultVal).trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (ensureV1 && !url.endsWith('/v1')) {
    url = `${url}/v1`;
  }
  return url;
};

export const ENV = {
  API_BASE_URL: normalizeUrl((import.meta as any).env?.VITE_API_BASE_URL, 'http://localhost:3001/v1', true),
  DASHBOARD_URL: normalizeUrl((import.meta as any).env?.VITE_DASHBOARD_URL, 'http://localhost:5173'),
  SITE_URL: normalizeUrl((import.meta as any).env?.VITE_SITE_URL, 'http://localhost:3002'),
  MAILPIT_URL: normalizeUrl((import.meta as any).env?.VITE_MAILPIT_URL, 'http://localhost:8025'),
};
