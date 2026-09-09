import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle,
  Eye,
  MousePointer,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
  Zap,
  Activity,
  RefreshCw,
  Terminal as TerminalIcon,
  Radio,
} from 'lucide-react';
import { api, MetricsRecord, EmailRecord, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ISPRadarWidget } from '../components/ISPRadarWidget';
import { LiveTerminalModal } from '../components/LiveTerminalModal';

export const Overview: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { user, organization } = useAuth();
  const [showTerminal, setShowTerminal] = useState(false);
  const [metrics, setMetrics] = useState<MetricsRecord>({
    totalSent: 0,
    delivered: 0,
    bounced: 0,
    queued: 0,
    deliveryRate: 100,
    averageLatencyMs: 38,
    recentActivity: [],
  });
  const [recentEmails, setRecentEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'node' | 'curl' | 'browser'>('node');

  const fetchDashboardData = async () => {
    try {
      const [m, ems] = await Promise.all([api.getMetrics(), api.getEmails()]);
      setMetrics(m);
      setRecentEmails(ems.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Emails Expédiés (Total)',
      value: metrics.totalSent.toLocaleString(),
      change: `${metrics.queued} en file`,
      trend: 'up',
      icon: Send,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
      border: 'border-[#10B981]/20',
    },
    {
      title: 'Taux de Délivrabilité',
      value: `${metrics.deliveryRate}%`,
      change: `${metrics.delivered} délivrés`,
      trend: 'up',
      icon: CheckCircle,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10',
      border: 'border-[#06B6D4]/20',
    },
    {
      title: 'Latence Moyenne d Ingestion',
      value: `${metrics.averageLatencyMs} ms`,
      change: 'Sub-50ms Edge Engine',
      trend: 'up',
      icon: Zap,
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FF6B00]/10',
      border: 'border-[#FF6B00]/20',
    },
    {
      title: 'Quota Mensuel Utilisé',
      value: `${metrics.totalSent} / ${(organization?.monthlyQuota || 50000).toLocaleString()}`,
      change: `Plan ${(organization?.plan || 'pro').toUpperCase()}`,
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  const codeSnippets = {
    node: `import { Tuma } from '@tuma/sdk';

const tuma = new Tuma({ apiKey: 'sk_live_...' });

const { data, error } = await tuma.emails.send({
  from: 'Tuma Cloud <notifications@votre-domaine.cd>',
  to: ['client@startup-kinshasa.cd'],
  subject: 'Reçu de paiement 50,000 CDF',
  template: 'mobile-money-receipt',
  variables: {
    amount: '50,000',
    currency: 'CDF',
    provider: 'M-Pesa (Vodacom)',
  },
});`,
    curl: `curl -X POST ${API_BASE}/emails \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Acme <contact@mon-domaine.cd>",
    "to": ["dev@startup-kinshasa.cd"],
    "subject": "Alerte de Sécurité OTP",
    "html": "<h2>Votre code de validation : 849 201</h2>"
  }'`,
    browser: `import { createTumaClient } from '@tuma/browser';

const tuma = createTumaClient({ publicKey: 'pk_live_...' });

// Envoi direct 100% sécurisé sans exposer vos clés secrètes
await tuma.sendContactForm({
  name: 'Alexandre Mwamba',
  email: 'alexandre@entreprise.cd',
  message: 'Demande d intégration API FinTech TUMA',
});`,
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(codeSnippets[selectedLanguage]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111827] via-[#111827] to-[#0B0F19] p-6 rounded-2xl border border-[#1F2937] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">
              Bonjour, {user?.name || 'Développeur'} 👋
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              {organization?.name || 'Mon Organisation'}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Votre cluster d'ingestion et de distribution d'emails transactionnels est 100% opérationnel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowTerminal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-[#1F2937] text-[#10B981] font-mono text-xs border border-[#10B981]/40 shadow-glow-emerald flex items-center gap-2 transition-all"
            title="Ouvrir le flux temps réel d'ingestion et de distribution"
          >
            <TerminalIcon className="w-4 h-4" />
            <span className="font-bold">⚡ Live Terminal Stream</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('playground')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs shadow-glow-emerald flex items-center gap-2 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Tester un Envoi en Direct</span>
          </button>
        </div>
      </div>

      {/* Real Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-[#111827] p-5 rounded-2xl border border-[#1F2937] hover:border-[#374151] transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9CA3AF]">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.border} border`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <span className="text-[11px] font-mono text-[#10B981]">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 2-Column: Live MongoDB Activity & Quickstart SDK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Activity Stream */}
        <div className="lg:col-span-6 bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-sm font-bold text-white">Activité Récente (Live MongoDB)</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('emails')}
              className="text-xs text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
            >
              Voir tous les logs ({metrics.totalSent}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentEmails.length > 0 ? (
            <div className="space-y-2.5">
              {recentEmails.map((email) => (
                <div
                  key={email._id}
                  onClick={() => onNavigate('emails')}
                  className="p-3 bg-[#0B0F19] hover:bg-[#1F2937] rounded-xl border border-[#1F2937] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white truncate max-w-[180px]">
                        {email.to.join(', ')}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                          email.status === 'delivered' || email.status === 'sent'
                            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                            : email.status === 'queued'
                            ? 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        {email.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{email.subject}</p>
                  </div>
                  <span className="text-[10px] text-[#6B7280] font-mono shrink-0">
                    {new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#9CA3AF] border-2 border-dashed border-[#1F2937] rounded-xl space-y-2">
              <p className="font-semibold text-white">Aucun email envoyé pour l'instant</p>
              <p>Envoyez votre premier email via le Playground ou l'API.</p>
              <button
                type="button"
                onClick={() => onNavigate('playground')}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-bold"
              >
                Envoyer un email test
              </button>
            </div>
          )}
        </div>

        {/* Developer SDK Quickstart */}
        <div className="lg:col-span-6 bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-bold text-white">Intégration Développeur Rapide</h3>
              </div>
              <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#1F2937] text-xs">
                {(['node', 'curl', 'browser'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-[#1F2937] text-[#10B981] font-bold shadow-sm'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    {lang === 'node' ? 'Node.js' : lang === 'curl' ? 'cURL' : 'Browser SDK'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative group">
              <pre className="bg-[#0B0F19] text-[#D1D5DB] font-mono text-xs p-4 rounded-xl border border-[#1F2937] overflow-x-auto leading-relaxed max-h-[260px]">
                {codeSnippets[selectedLanguage]}
              </pre>
              <button
                type="button"
                onClick={copySnippet}
                className="absolute top-3 right-3 p-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white border border-[#374151] transition-colors"
                title="Copier le code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs text-[#9CA3AF]">
            <span>Documentation SDK complète disponible</span>
            <button
              type="button"
              onClick={() => onNavigate('webhooks')}
              className="text-[#10B981] hover:underline font-semibold"
            >
              Gérer les Clés d'API →
            </button>
          </div>
        </div>
      </div>

      {/* ISPRadarWidget for African & Global Telecom Telemetry */}
      <ISPRadarWidget />

      {/* Live Stream Terminal Modal */}
      <LiveTerminalModal isOpen={showTerminal} onClose={() => setShowTerminal(false)} />
    </div>
  );
};
