import React from 'react';
import { ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2, Lock, Key, Globe, FileCode } from 'lucide-react';

export const SecurityPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => onNavigate('/features')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux fonctionnalités</span>
        </button>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sécurité Cryptographique & Protection des Données</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Protection de grade bancaire pour vos communications.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Conçu pour répondre aux normes de conformité les plus exigeantes (BCC, OHADA, RGPD). Chiffrement TLS 1.3 de bout en bout, clés d'API avec restriction d'IP CIDR et signature RSA 2048-bit.
          </p>
        </div>

        {/* 4 Pillars of Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Key className="w-6 h-6 text-[#10B981]" />
            <h3 className="font-bold text-white text-base">Clés d'API & Hachage Argon2id</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Vos secrets `sk_live_...` ne sont jamais stockés en clair. Ils sont hachés avec le standard cryptographique Argon2id et peuvent être révoqués instantanément.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Lock className="w-6 h-6 text-[#06B6D4]" />
            <h3 className="font-bold text-white text-base">Whitelist d'IP Serveur (CIDR)</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Verrouillez vos clés d'API secrètes pour qu'elles ne puissent être utilisées que depuis les adresses IP de vos serveurs de production (ex: `197.234.218.42/32`).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Globe className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-base">DKIM RSA 2048, SPF & DMARC</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Validation automatique de vos enregistrements DNS pour éliminer les risques d'usurpation d'identité et de phishing sur votre nom de domaine.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <FileCode className="w-6 h-6 text-[#FF6B00]" />
            <h3 className="font-bold text-white text-base">Webhooks Signés HMAC-SHA256</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Chaque événement de livraison (sent, opened, clicked, bounced) est signé cryptographiquement avec un secret HMAC pour une vérification infalsifiable.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Sécurisez votre flux de production</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Créez votre première clé API avec IP Whitelist en 1 clic.</p>
          </div>
          <a
            href="http://localhost:5173/webhooks"
            className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Gérer les Clés API</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
