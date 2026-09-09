import React, { useState } from 'react';
import {
  FileCode,
  Terminal,
  Key,
  Send,
  Radio,
  Layers,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Code,
} from 'lucide-react';
import { ENV } from '../config/env';

export const DocsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<string>('quickstart');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections = [
    { id: 'quickstart', label: '1. Démarrage Rapide', icon: Terminal },
    { id: 'auth', label: '2. Authentification & Clés', icon: Key },
    { id: 'send-email', label: '3. Envoi d Emails (POST /v1/emails)', icon: Send },
    { id: 'templates', label: '4. Variables Handlebars', icon: Sparkles },
    { id: 'webhooks', label: '5. Webhooks & Signatures HMAC', icon: Layers },
    { id: 'sdk', label: '6. SDKs Officiels', icon: Code },
  ];

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 sticky top-28 glass-panel rounded-2xl p-4 border border-[#1F2937] space-y-1">
            <div className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280]">
              Documentation API
            </div>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 font-bold'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#111827]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{sec.label}</span>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}

            <div className="pt-4 border-t border-[#1F2937] mt-3">
              <a
                href={`${ENV.DASHBOARD_URL}/playground`}
                className="w-full py-2 px-3 rounded-xl bg-[#111827] text-white text-xs font-semibold flex items-center justify-between hover:bg-[#1F2937] border border-[#1F2937]"
              >
                <span>Ouvrir le Playground</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#10B981]" />
              </a>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-8">
            {/* Section 1: Quickstart */}
            {activeSection === 'quickstart' && (
              <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">Démarrage Rapide (Quickstart)</h1>
                  <p className="text-sm text-[#9CA3AF]">
                    Intégrez l'API TUMA Cloud en moins de 2 minutes dans votre application Node.js ou Next.js.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-[#D1D5DB]">
                  <h3 className="text-sm font-bold text-white">1. Installation du package</h3>
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] flex items-center justify-between font-mono">
                    <span className="text-[#34D399]">npm install @tuma/sdk</span>
                    <button
                      type="button"
                      onClick={() => copyCode('npm install @tuma/sdk', 'qs_npm')}
                      className="p-1 rounded bg-[#111827] text-[#9CA3AF] hover:text-white"
                    >
                      {copiedId === 'qs_npm' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white pt-2">2. Premier envoi d'email transactionnel</h3>
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] font-mono text-[#D1D5DB] leading-relaxed overflow-x-auto relative">
                    <button
                      type="button"
                      onClick={() =>
                        copyCode(
                          `import { Tuma } from '@tuma/sdk';\n\nconst tuma = new Tuma({ apiKey: 'sk_live_...' });\n\nawait tuma.emails.send({\n  from: 'Acme <notifications@mon-domaine.cd>',\n  to: ['client@startup.cd'],\n  subject: 'Confirmation de paiement',\n  html: '<h1>Paiement reçu !</h1>',\n});`,
                          'qs_code'
                        )
                      }
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#111827] text-[#9CA3AF] hover:text-white"
                    >
                      {copiedId === 'qs_code' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre>
                      <code>{`import { Tuma } from '@tuma/sdk';

const tuma = new Tuma({ apiKey: process.env.TUMA_API_KEY });

const { data, error } = await tuma.emails.send({
  from: 'Acme <notifications@mon-domaine.cd>',
  to: ['client@startup.cd'],
  subject: 'Confirmation de votre reçu de paiement',
  html: '<h1>Votre transaction a été validée avec succès !</h1>',
});`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Auth */}
            {activeSection === 'auth' && (
              <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">Authentification & Clés d'API</h1>
                  <p className="text-sm text-[#9CA3AF]">
                    TUMA Cloud utilise des clés d'API Bearer token sécurisées avec hachage Argon2id et restriction d'adresse IP (CIDR).
                  </p>
                </div>

                <div className="space-y-4 text-xs text-[#D1D5DB]">
                  <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F2937] space-y-2">
                    <span className="font-bold text-white">Format des En-têtes HTTP Requis :</span>
                    <pre className="font-mono text-[#06B6D4]">Authorization: Bearer sk_live_9c7acdc0c3b90fa1...</pre>
                  </div>

                  <h3 className="text-sm font-bold text-white pt-2">Types de clés disponibles :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
                      <span className="font-bold text-[#10B981] font-mono">sk_live_... (Clé Secrète Backend)</span>
                      <p className="text-[#9CA3AF]">
                        À utiliser uniquement sur vos serveurs backend sécurisés. Accès complet aux envois, métriques et gestion des templates.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
                      <span className="font-bold text-[#06B6D4] font-mono">pk_live_... (Clé Publique Frontend)</span>
                      <p className="text-[#9CA3AF]">
                        Utilisable directement depuis React/Vue/Mobile avec validation CORS stricte et templates prédéfinis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Send Email POST /v1/emails */}
            {activeSection === 'send-email' && (
              <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono font-bold text-xs">POST</span>
                    <h1 className="text-2xl font-black text-white font-mono">/v1/emails</h1>
                  </div>
                  <p className="text-sm text-[#9CA3AF]">
                    Ingestion asynchrone ultra-rapide. Retourne immédiatement un code HTTP 202 Accepted.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] font-mono text-[#D1D5DB]">
                    <pre>
                      <code>{`POST /v1/emails HTTP/1.1
Host: api.tuma.dev
Authorization: Bearer sk_live_...
Idempotency-Key: idemp_order_84920
Content-Type: application/json

{
  "from": "Acme Pay <notifications@mon-domaine.cd>",
  "to": ["client@banque.cd"],
  "subject": "Reçu de Paiement M-Pesa",
  "template": "payment-receipt",
  "variables": {
    "amount": "45,000",
    "currency": "CDF",
    "txId": "MPESA-84920"
  },
  "fallback": {
    "enabled": true,
    "phone": "+243819991234",
    "channel": "whatsapp"
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Templates Handlebars */}
            {activeSection === 'templates' && (
              <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">Variables & Moteur Handlebars</h1>
                  <p className="text-sm text-[#9CA3AF]">
                    Personnalisez vos emails dynamiquement avec la syntaxe Handlebars standard.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] font-mono text-xs text-[#D1D5DB]">
                  <pre>
                    <code>{`<h2>Bonjour {{customerName}},</h2>
<p>Nous confirmons la réception de votre paiement de 
   <strong>{{amount}} {{currency}}</strong>.</p>
<p>Référence transaction : <code>{{transactionId}}</code></p>`}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Section 5: Webhooks */}
            {activeSection === 'webhooks' && (
              <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">Webhooks & Signatures HMAC-SHA256</h1>
                  <p className="text-sm text-[#9CA3AF]">
                    Recevez des notifications HTTP en temps réel pour chaque changement de statut d'email (sent, opened, clicked, bounced).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] font-mono text-xs text-[#06B6D4]">
                  <pre>
                    <code>{`X-Tuma-Signature: t=1693148920,v1=9c7acdc0c3b90fa1098f4abacfd3a0ac...`}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Section 6: SDKs */}
            {activeSection === 'sdk' && (
              <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white">SDKs & Librairies Officielles</h1>
                  <p className="text-sm text-[#9CA3AF]">
                    Bibliothèques clientes maintenues par l'équipe d'ingénierie TUMA Cloud.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-1">
                    <span className="text-[#10B981] font-bold">Node.js / TypeScript SDK</span>
                    <p className="text-[#9CA3AF]">npm install @tuma/sdk</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-1">
                    <span className="text-[#06B6D4] font-bold">Python SDK</span>
                    <p className="text-[#9CA3AF]">pip install tuma-cloud</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-1">
                    <span className="text-[#FF6B00] font-bold">Go SDK</span>
                    <p className="text-[#9CA3AF]">go get github.com/tuma-cloud/tuma-go</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-1">
                    <span className="text-purple-400 font-bold">PHP / Laravel SDK</span>
                    <p className="text-[#9CA3AF]">composer require tuma/tuma-php</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
