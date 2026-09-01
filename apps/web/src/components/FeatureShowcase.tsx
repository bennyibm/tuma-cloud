import React, { useState } from 'react';
import {
  Zap,
  Radio,
  FileCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  MessageSquare,
  Lock,
} from 'lucide-react';

export const FeatureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const features = [
    {
      id: 'speed',
      icon: Zap,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/15',
      border: 'border-[#10B981]/30',
      title: 'Ingestion Supersonique < 38ms',
      subtitle: 'Architecture asynchrone BullMQ & Redis 7.2',
      description:
        'Vos APIs retournent un code HTTP 202 Accepted en moins de 38 millisecondes. Les tâches de compilation Handlebars, signature cryptographique DKIM et envoi SMTP sont parallélisées sur des workers haute densité.',
      stats: [
        { label: 'Temps de réponse API', value: '1.8 ms' },
        { label: 'Débit de traitement', value: '10,000 / sec' },
        { label: 'Disponibilité cluster', value: '99.99%' },
      ],
    },
    {
      id: 'radar',
      icon: Radio,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/15',
      border: 'border-[#06B6D4]/30',
      title: 'Radar de Délivrabilité Télécoms',
      subtitle: 'Surveillance FAI en temps réel (Vodacom, Airtel, Orange)',
      description:
        'Fini les emails qui finissent dans les courriers indésirables. TUMA surveille en continu la réputation des adresses IP d expédition et optimise l acheminement vers les serveurs de messagerie d Afrique et du Monde.',
      stats: [
        { label: 'Taux Inbox Vodacom', value: '99.9%' },
        { label: 'Taux Inbox Orange', value: '99.8%' },
        { label: 'Taux Inbox Gmail / Outlook', value: '99.6%' },
      ],
    },
    {
      id: 'studio',
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
      title: 'Studio Visuel & Score Anti-Spam IA',
      subtitle: 'Éditeur Drag & Drop et modèles Canva Pro intégrés',
      description:
        'Concevez des reçus de paiement, alertes bancaires et emails d onboarding professionnels sans toucher une ligne de HTML. L analyseur IA scanne vos templates en direct et garantit un score de délivrabilité maximal.',
      stats: [
        { label: 'Modèles Pro prêts à l emploi', value: '12+' },
        { label: 'Score Anti-Spam en direct', value: '100 / 100' },
        { label: 'Upload d images & logos', value: 'Instantané' },
      ],
    },
    {
      id: 'omnichannel',
      icon: MessageSquare,
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FF6B00]/15',
      border: 'border-[#FF6B00]/30',
      title: 'Bascule Omnicanale SMS / WhatsApp',
      subtitle: 'Failover automatique vers le numéro mobile du destinataire',
      description:
        'Si un email transactionnel critique (ex: code OTP ou alerte de sécurité) n est pas ouvert sous 5 minutes, TUMA bascule automatiquement la notification sur WhatsApp ou SMS (+243...) pour un taux de lecture de 100%.',
      stats: [
        { label: 'Délai de bascule configurable', value: '1 à 15 min' },
        { label: 'Canaux supportés', value: 'WhatsApp & SMS' },
        { label: 'Taux d ouverture final', value: '100%' },
      ],
    },
  ];

  const currentFeature = features[activeTab];

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#10B981]">
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Capacités</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Une infrastructure pensée pour les exigences de la FinTech.
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Combinez la puissance d'une API pour développeurs avec des outils de délivrabilité avancés.
          </p>
        </div>

        {/* Feature Tabs Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {features.map((f, idx) => {
            const Icon = f.icon;
            const isSelected = activeTab === idx;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#111827] border-[#10B981] ring-1 ring-[#10B981]/30 shadow-glow-emerald'
                    : 'bg-[#111827]/40 hover:bg-[#111827] border-[#1F2937]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-bold text-sm text-white mb-1">{f.title}</h3>
                <p className="text-xs text-[#9CA3AF] line-clamp-2">{f.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Showcase Panel */}
        <div className="glass-panel rounded-3xl p-8 lg:p-12 border border-[#1F2937] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${currentFeature.bg} ${currentFeature.color} border ${currentFeature.border}`}>
                  Pilier #{activeTab + 1}
                </span>
                <h3 className="text-2xl font-black text-white">{currentFeature.title}</h3>
              </div>

              <p className="text-sm text-[#D1D5DB] leading-relaxed">
                {currentFeature.description}
              </p>

              {/* Stats highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1F2937]">
                {currentFeature.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-xl font-black text-white font-mono">{s.value}</div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <a
                  href="http://localhost:5173/register"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#10B981] hover:underline"
                >
                  <span>Tester cette fonctionnalité sur le Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Visual Decorative Card */}
            <div className="lg:col-span-5 bg-[#05070B] rounded-2xl p-6 border border-[#1F2937] space-y-4 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2937] text-[11px] text-[#6B7280]">
                <span>TUMA_CLUSTER_NODE_01</span>
                <span className="text-[#10B981] font-bold">● HEALTHY</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1F2937] flex items-center justify-between">
                  <span className="text-[#9CA3AF]">DKIM 2048-bit :</span>
                  <span className="text-[#10B981] font-semibold">VALIDÉ (v=1; a=rsa-sha256)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1F2937] flex items-center justify-between">
                  <span className="text-[#9CA3AF]">SPF Alignment :</span>
                  <span className="text-[#10B981] font-semibold">PASS (mail.tuma.dev)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1F2937] flex items-center justify-between">
                  <span className="text-[#9CA3AF]">Anti-Spam Score :</span>
                  <span className="text-[#10B981] font-bold">100/100 (Optimal)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#1F2937] flex items-center justify-between">
                  <span className="text-[#9CA3AF]">Failover Canal :</span>
                  <span className="text-[#FF6B00] font-semibold">WhatsApp Gateway Actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
