import React from 'react';
import { Radio, ArrowLeft, ArrowRight, CheckCircle2, Globe, Shield, Activity, Zap } from 'lucide-react';
import { ENV } from '../../config/env';

export const RadarPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const isps = [
    {
      name: 'Vodacom RDC (M-Pesa)',
      domain: '@vodacom.cd',
      inbox: '99.9%',
      rtt: '24 ms',
      tls: 'TLS 1.3 AES-256',
      notes: 'Routage direct via liaison dédiée IP Kinshasa Gombe.',
    },
    {
      name: 'Orange RDC (Money)',
      domain: '@orange.cd',
      inbox: '99.8%',
      rtt: '28 ms',
      tls: 'TLS 1.3 Chacha20',
      notes: 'Optimisation automatique des quotas MX pour éviter les blocages de débit.',
    },
    {
      name: 'Airtel Africa',
      domain: '@airtel.cd',
      inbox: '99.7%',
      rtt: '31 ms',
      tls: 'TLS 1.2 RSA',
      notes: 'Surveillance proactive des adresses IP chaudes certifiées.',
    },
    {
      name: 'Starlink & Liquid Telecom',
      domain: 'Backbone Fibre',
      inbox: '100.0%',
      rtt: '19 ms',
      tls: 'TLS 1.3 Quantum',
      notes: 'Canal haute priorité pour les liaisons interbancaires.',
    },
  ];

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 text-xs font-bold shadow-glow-cyber">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Radar de Délivrabilité Télécoms & Réputation FAI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            100% Inbox garanti sur tous les opérateurs d'Afrique.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Les serveurs de messagerie des FAI locaux appliquent des filtres stricts. TUMA préchauffe vos adresses IP et négocie les connexions TLS de pointe pour atterrir directement en boîte principale.
          </p>
        </div>

        {/* ISP Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isps.map((isp) => (
            <div key={isp.name} className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{isp.name}</h3>
                <span className="text-xs font-mono text-[#10B981] font-bold px-2 py-0.5 rounded bg-[#10B981]/15 border border-[#10B981]/30">
                  {isp.inbox} Inbox
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">{isp.notes}</p>
              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs font-mono text-[#6B7280]">
                <span>Latence : <strong className="text-white">{isp.rtt}</strong></span>
                <span>Chiffrement : <strong className="text-[#06B6D4]">{isp.tls}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Deliverability Shield Highlights */}
        <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
          <h3 className="text-lg font-bold text-white">Le Bouclier de Délivrabilité TUMA</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#D1D5DB]">
            <div className="space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Préchauffage IP Intelligent</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Augmentation graduelle du volume pour bâtir une réputation irréprochable auprès de Gmail, Yahoo et des FAI africains.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Blacklist O(1) Instantanée</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Élimination automatique des hard bounces pour ne jamais dégrader le score d'expéditeur de votre domaine.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>DKIM RSA 2048 & DMARC</span>
              </div>
              <p className="text-[#9CA3AF] leading-relaxed">
                Chaque email est signé cryptographiquement avec une clé 2048 bits générée sur votre domaine dédié.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#06B6D4]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-cyber">
          <div>
            <h3 className="text-xl font-bold text-white">Testez la délivrabilité de votre domaine</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Configurez vos enregistrements DNS en 2 minutes.</p>
          </div>
          <a
            href={`${ENV.DASHBOARD_URL}/domains`}
            className="px-6 py-3 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Configurer un Domaine</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
