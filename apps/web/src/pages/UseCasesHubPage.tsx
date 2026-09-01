import React from 'react';
import {
  CreditCard,
  Key,
  ShoppingBag,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Layers,
} from 'lucide-react';

export const UseCasesHubPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const useCases = [
    {
      id: 'fintech-payments',
      path: '/use-cases/fintech-payments',
      icon: CreditCard,
      badge: 'FinTech & Mobile Money',
      title: 'Reçus de Paiement & Transactions Critiques',
      subtitle: 'Vodacom M-Pesa, Orange Money, Airtel Money & Virements Bancaires',
      description:
        'Envoyez des reçus de transaction instantanés et infalsifiables. Réduisez vos litiges de paiement de 85% grâce à une preuve de délivrance horodatée sous 38ms.',
      metrics: [
        { label: 'Délai d acheminement', value: '< 1.2 sec' },
        { label: 'Réduction des litiges', value: '-85%' },
        { label: 'Taux de délivrance', value: '99.98%' },
      ],
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/15',
      border: 'border-[#10B981]/30',
    },
    {
      id: 'banking-otp',
      path: '/use-cases/banking-otp',
      icon: Key,
      badge: 'Banques & Sécurité 2FA',
      title: 'Codes OTP & Authentification Forte',
      subtitle: 'Validation de Connexion, Réinitialisation de PIN & Alertes de Fraude',
      description:
        'Délivrez vos codes d authentification à deux facteurs en moins de 3 secondes avec bascule automatique WhatsApp/SMS si le client n a pas de connexion data active.',
      metrics: [
        { label: 'Temps de réception OTP', value: '< 2.4 sec' },
        { label: 'Bascule WhatsApp failover', value: '100% lecture' },
        { label: 'Conformité bancaire', value: 'BCC & OHADA' },
      ],
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/15',
      border: 'border-[#06B6D4]/30',
    },
    {
      id: 'ecommerce-logistics',
      path: '/use-cases/ecommerce-logistics',
      icon: ShoppingBag,
      badge: 'E-commerce & Logistique',
      title: 'Suivi de Livraison & Facturation OHADA',
      subtitle: 'Confirmation de Panier, Suivi de Colis & Factures Proforma',
      description:
        'Accompagnez vos acheteurs à chaque étape : de la validation de commande jusqu à la remise en main propre par le livreur, avec factures fiscales jointes en PDF.',
      metrics: [
        { label: 'Ouverture des avis de coursier', value: '88%' },
        { label: 'Génération de facture PDF', value: 'Instantanée' },
        { label: 'Retour transporteur', value: 'Live Webhook' },
      ],
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FF6B00]/15',
      border: 'border-[#FF6B00]/30',
    },
    {
      id: 'saas-onboarding',
      path: '/use-cases/saas-onboarding',
      icon: Rocket,
      badge: 'SaaS & Applications Cloud',
      title: 'Onboarding Utilisateur & Alertes DevOps',
      subtitle: 'Email de Bienvenue, Rapports Hebdomadaires & Notifications Système',
      description:
        'Optimisez l activation de vos nouveaux utilisateurs avec des séquences d onboarding engageantes et alertez vos équipes d ingénierie en cas d incident de production.',
      metrics: [
        { label: 'Taux de clic sur le CTA', value: '42%' },
        { label: 'Intégration SDK', value: '< 2 min' },
        { label: 'Score Anti-Spam IA', value: '100/100' },
      ],
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
    },
  ];

  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
            <Layers className="w-3.5 h-3.5" />
            <span>Cas d'Usage Métiers & Industries</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Conçu pour les flux critiques de l'économie numérique africaine.
          </h1>
          <p className="text-base text-[#9CA3AF] leading-relaxed">
            De la FinTech en hyper-croissance à l'institution bancaire centenaire, découvrez comment les leaders de la région sécurisent leurs communications transactionnelles.
          </p>
        </div>

        {/* Use Cases Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.id}
                onClick={() => onNavigate(uc.path)}
                className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#1F2937] hover:border-[#10B981]/50 transition-all flex flex-col justify-between space-y-6 cursor-pointer group hover:-translate-y-1 shadow-2xl relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${uc.bg} ${uc.border} border flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${uc.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0B0F19] text-[#9CA3AF] border border-[#1F2937]">
                      {uc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#10B981] transition-colors">
                      {uc.title}
                    </h3>
                    <div className="text-xs text-[#10B981] font-semibold mt-1">{uc.subtitle}</div>
                    <p className="text-xs text-[#9CA3AF] mt-2.5 leading-relaxed">
                      {uc.description}
                    </p>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#1F2937]">
                    {uc.metrics.map((m) => (
                      <div key={m.label}>
                        <div className="text-base font-black text-white font-mono">{m.value}</div>
                        <div className="text-[10px] text-[#6B7280] mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[#10B981] group-hover:translate-x-1 transition-transform">
                  <span>Découvrir l'architecture de ce cas d'usage</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Global FinTech Network Testimonial Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#111827] via-[#0B0F19] to-[#05070B] border border-[#1F2937] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#10B981]">
              <ShieldCheck className="w-4 h-4" />
              <span>Conformité & SLA FinTech Garanti</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Vous traitez plus de 500 000 transactions par mois ?
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Bénéficiez d'une adresse IP dédiée préchauffée, d'un accompagnement à la conformité bancaire et d'un canal Slack prioritaire avec notre équipe d'infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-glow-emerald flex items-center justify-center gap-2"
            >
              <span>Demander une Étude Technique</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
