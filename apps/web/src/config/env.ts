// Configuration des variables d'environnement pour apps/web
export const ENV = {
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/v1',
  DASHBOARD_URL: (import.meta as any).env?.VITE_DASHBOARD_URL || 'http://localhost:5173',
  SITE_URL: (import.meta as any).env?.VITE_SITE_URL || 'http://localhost:3002',
  MAILPIT_URL: (import.meta as any).env?.VITE_MAILPIT_URL || 'http://localhost:8025',
};
