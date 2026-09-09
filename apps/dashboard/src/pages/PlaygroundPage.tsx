import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  Layers,
  Terminal,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { getAuthHeaders, API_BASE } from '../services/api';

export const PlaygroundPage: React.FC = () => {
  const [from, setFrom] = useState('Tuma Notifications <notifications@tuma.dev>');
  const [to, setTo] = useState('benny@startup-kinshasa.cd');
  const [enableFallback, setEnableFallback] = useState(false);
  const [fallbackPhone, setFallbackPhone] = useState('+243 81 999 1234');
  const [subject, setSubject] = useState('🚀 Test interactif depuis le Dashboard TUMA, {{name}} !');
  const [variables, setVariables] = useState('{\n  "name": "Benny",\n  "company": "Kinshasa FinTech"\n}');
  const [html, setHtml] = useState(
    `<div style="font-family: sans-serif; background: #0B0F19; color: #F9FAFB; padding: 32px; border-radius: 12px;">\n  <h1 style="color: #10B981;">Bonjour {{name}} 🚀</h1>\n  <p>Votre email transactionnel expédié via <strong>TUMA Cloud</strong> a été délivré avec succès.</p>\n  <div style="margin: 24px 0;">\n    <a href="https://tuma.dev/dashboard" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accéder au Dashboard</a>\n  </div>\n  <p style="color: #9CA3AF; font-size: 12px;">Société : {{company}} | Télémétrie 100% active</p>\n</div>`,
  );

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch {
        throw new Error('Les variables doivent être un JSON valide.');
      }

      const headers = getAuthHeaders();
      headers['Idempotency-Key'] = `idemp_play_${Date.now()}`;

      const res = await fetch(`${API_BASE}/emails`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          variables: parsedVariables,
          tags: [{ name: 'source', value: 'dashboard_playground' }],
          ...(enableFallback
            ? {
                fallback: {
                  enabled: true,
                  phone: fallbackPhone,
                  channel: 'whatsapp',
                },
              }
            : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.detail || 'Erreur lors de l envoi');
      }

      setResponse(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Playground d'Envoi Interactif</span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
            Live Testing
          </span>
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Testez l'ingestion asynchrone BullMQ, le rendu Handlebars et le tracking d'ouvertures en temps réel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <form onSubmit={handleSend} className="lg:col-span-7 bg-[#111827] rounded-xl border border-[#1F2937] p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Expéditeur (From)</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Destinataire (To)</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Objet / Sujet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#0B0F19] text-xs text-white px-3 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
              Variables JSON (Handlebars)
            </label>
            <textarea
              rows={3}
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full bg-[#0B0F19] font-mono text-xs text-[#34D399] p-3 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">Corps HTML (Template)</label>
            <textarea
              rows={6}
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className="w-full bg-[#0B0F19] font-mono text-xs text-[#D1D5DB] p-3 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
              required
            />
          </div>

          {/* Omnichannel Fallback Toggle */}
          <div className="p-3.5 bg-[#0B0F19] rounded-xl border border-[#1F2937] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-bold text-white">Bascule SMS / WhatsApp (Fallback RDC)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFallback}
                  onChange={(e) => setEnableFallback(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#10B981]" />
              </label>
            </div>

            {enableFallback && (
              <div className="flex items-center gap-2 animate-in fade-in pt-1">
                <Smartphone className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <input
                  type="tel"
                  placeholder="+243 81 999 1234"
                  value={fallbackPhone}
                  onChange={(e) => setFallbackPhone(e.target.value)}
                  className="w-full bg-[#111827] text-xs text-white px-2.5 py-1.5 rounded-lg border border-[#1F2937] focus:border-[#10B981]"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-[#6B7280]">Endpoint : POST {API_BASE}/emails</span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald transition-all flex items-center gap-2"
            >
              <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Ingestion...' : 'Envoyer via TUMA API'}</span>
            </button>
          </div>
        </form>

        {/* Live Response & Mailpit Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Response Box */}
          <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#10B981]" /> Réponse API HTTP 202
              </h3>
              {response && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                  Accepted (202)
                </span>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {response ? (
              <div className="space-y-3">
                <pre className="bg-[#0B0F19] p-3 rounded-lg border border-[#1F2937] text-[11px] font-mono text-[#34D399] overflow-x-auto">
                  <code>{JSON.stringify(response, null, 2)}</code>
                </pre>

                <div className="bg-[#0B0F19] p-3 rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Email mis en file d'attente BullMQ</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Le worker compile le Handlebars, injecte le pixel 1x1 GIF et expédie le message via SMTP.
                  </p>
                </div>

                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-semibold rounded-lg shadow-glow-solar flex items-center justify-center gap-2 transition-all"
                >
                  <span>Ouvrir dans Mailpit Web (8025)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#6B7280]">
                Remplissez le formulaire et cliquez sur <strong>Envoyer</strong> pour observer la réponse JSON de l'API.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
