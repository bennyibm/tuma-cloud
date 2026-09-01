import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Terminal,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'node' | 'python' | 'curl' | 'go' | 'php'>('node');
  const [copied, setCopied] = useState(false);

  const snippets = {
    node: `import { Tuma } from '@tuma/sdk';

const tuma = new Tuma({ apiKey: process.env.TUMA_API_KEY });

// Expédition ultra-rapide (<38ms) avec rendu Handlebars et DKIM RSA 2048
const { data, error } = await tuma.emails.send({
  from: 'Acme FinTech <notifications@mon-domaine.cd>',
  to: ['client@startup-kinshasa.cd'],
  subject: 'Reçu de Paiement M-Pesa — {{amount}} {{currency}}',
  template: 'mobile-money-receipt',
  variables: {
    amount: '45,000',
    currency: 'CDF',
    provider: 'Vodacom M-Pesa',
    customerName: 'Alexandre Mwamba',
  },
  // Bascule automatique SMS / WhatsApp si non ouvert sous 5 min
  fallback: {
    enabled: true,
    phone: '+243819991234',
    channel: 'whatsapp',
  },
});`,
    python: `import os
from tuma import TumaClient

tuma = TumaClient(api_key=os.environ.get("TUMA_API_KEY"))

# Envoi transactionnel avec bascule Omnicanale
response = tuma.emails.send(
    sender="FinTech Alert <security@mon-domaine.cd>",
    to=["alexandre@banque.cd"],
    subject="Votre code de validation OTP : {{otpCode}}",
    template="auth-otp-code",
    variables={"otpCode": "892 104", "expiresIn": "5 minutes"},
    tags=[{"name": "priority", "value": "critical"}]
)`,
    curl: `curl -X POST https://api.tuma.dev/v1/emails \\
  -H "Authorization: Bearer sk_live_9c7acdc0c3b9..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: idemp_order_84920" \\
  -d '{
    "from": "Tuma Notifications <notifications@mon-domaine.cd>",
    "to": ["client@startup-kinshasa.cd"],
    "subject": "Confirmation de votre commande #84920",
    "html": "<h2>Merci pour votre achat !</h2><p>Paiement reçu via Orange Money.</p>"
  }'`,
    go: `package main

import (
    "context"
    "fmt"
    "github.com/tuma-cloud/tuma-go"
)

func main() {
    client := tuma.NewClient("sk_live_9c7acdc0c3b9...")

    resp, err := client.Emails.Send(context.Background(), &tuma.SendEmailRequest{
        From:    "Acme Pay <billing@mon-domaine.cd>",
        To:      []string{"client@banque.cd"},
        Subject: "Facture N° 2026-0849 réglée",
        HTML:    "<h1>Paiement validé avec succès</h1>",
    })
    fmt.Printf("Email Queued: %s\\n", resp.ID)
}`,
    php: `<?php
require 'vendor/autoload.php';

use Tuma\\TumaClient;

$tuma = new TumaClient('sk_live_9c7acdc0c3b9...');

$result = $tuma->emails->send([
    'from' => 'Support <support@mon-domaine.cd>',
    'to' => ['alexandre@entreprise.cd'],
    'subject' => 'Votre accès développeur TUMA Cloud est actif',
    'template' => 'welcome-onboarding',
    'variables' => ['name' => 'Alexandre', 'plan' => 'FinTech Pro'],
]);`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#10B981]/15 via-[#06B6D4]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981] shadow-glow-emerald">
              <Zap className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
              <span>L'Infrastructure Email Transactionnelle Nouvelle Génération</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              La puissance d'envoi d'emails pour{' '}
              <span className="bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#06B6D4] bg-clip-text text-transparent">
                l'Afrique et le Monde.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base text-[#9CA3AF] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Délivrez vos reçus de paiement Mobile Money, codes OTP 2FA et alertes critiques en moins de <strong className="text-white">38ms</strong> avec <strong className="text-[#10B981]">100% de taux Inbox garanti</strong> sur Vodacom, Orange, Airtel, Gmail et Outlook.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="http://localhost:5173/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-sm font-bold shadow-glow-emerald flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Créer un Compte Gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#sandbox"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-semibold border border-[#1F2937] hover:border-[#374151] flex items-center justify-center gap-2 transition-all"
              >
                <Terminal className="w-4 h-4 text-[#FF6B00]" />
                <span>Tester la Sandbox Live</span>
              </a>
            </div>

            {/* Live Metrics Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#1F2937] text-left">
              <div>
                <div className="text-2xl font-black text-white font-mono">&lt; 38ms</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Latence d'ingestion</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#10B981] font-mono">100%</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Délivrabilité Inbox</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#FF6B00] font-mono">3 FAI</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Vodacom, Orange, Airtel</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Code Switcher */}
          <div className="lg:col-span-6">
            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-[#1F2937]">
              {/* Window Header */}
              <div className="bg-[#0B0F19] px-4 py-3 border-b border-[#1F2937] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>

                {/* Language Switcher Tabs */}
                <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
                  {(['node', 'python', 'curl', 'go', 'php'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                        activeLang === lang
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {lang === 'node' ? 'Node.js' : lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937] transition-colors"
                  title="Copier le code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Code Snippet Box */}
              <div className="p-5 bg-[#05070B] overflow-x-auto text-xs font-mono leading-relaxed text-[#D1D5DB]">
                <pre>
                  <code>{snippets[activeLang]}</code>
                </pre>
              </div>

              {/* Bottom Feature Badges */}
              <div className="bg-[#0B0F19] px-5 py-3 border-t border-[#1F2937] flex items-center justify-between text-[11px] text-[#9CA3AF] font-mono">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DKIM RSA 2048 • SPF Validé</span>
                </span>
                <span className="text-[#6B7280]">npm i @tuma/sdk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
