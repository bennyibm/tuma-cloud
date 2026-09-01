import React from 'react';
import {
  Zap,
  Radio,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Layers,
  CheckCircle2,
  Lock,
  Cpu,
  Smartphone,
  Globe,
} from 'lucide-react';

interface FeaturesHubPageProps {
  onNavigate: (path: string) => void;
}

export const FeaturesHubPage: React.FC<FeaturesHubPageProps> = ({ onNavigate }) => {
  const featureCards = [
    {
      id: 'speed',
      path: '/features/speed',
      icon: Zap,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/15',
      border: 'border-[#10B981]/30',
      title: 'Moteur d Ingestion Sub-38ms',
      subtitle: 'Architecture asynchrone ultra-haute cadence propulsée par BullMQ & Redis 7.2.',
      highlights: ['Latence API < 2ms', '10 000 req/sec', 'Validation d idempotence O(1)'],
      badge: 'Performance & Échelle',
    },
    {
      id: 'radar',
      path: '/features/radar',
      icon: Radio,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/15',
      border: 'border-[#06B6D4]/30',
      title: 'Radar de Délivrabilité Télécoms & FAI',
      subtitle: 'Surveillance en direct des routes vers Vodacom RDC, Orange, Airtel Africa et Starlink.',
      highlights: ['Taux Inbox garanti 99.9%', 'IP Warming intelligent', 'Détection de greylisting'],
      badge: 'Connectivité Africaine',
    },
    {
      id: 'studio',
      path: '/features/studio',
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/30',
      title: 'Studio Visuel & Score Anti-Spam IA',
      subtitle: 'Concevez des modèles d emails en glisser-déposer avec analyseur anti-spam prédictif.',
      highlights: ['Modèles Canva Pro', 'Score Anti-Spam IA en direct', 'Variables Handlebars'],
      badge: 'Design & IA',
    },
    {
      id: 'omnichannel',
      path: '/features/omnichannel',
      icon: MessageSquare,
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FF6B00]/15',
      border: 'border-[#FF6B00]/30',
      title: 'Bascule Omnicanale SMS / WhatsApp',
      subtitle: 'Bascule automatique en cas de non-ouverture de l email sous 5 minutes.',
      highlights: ['Failover SMS & WhatsApp (+243)', 'Taux d ouverture final 100%', 'Délai configurable'],
      badge: 'Haute Disponibilité',
    },
    {
      id: 'security',
      path: '/features/security',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      title: 'Sécurité, DKIM RSA 2048 & IP Whitelist',
      subtitle: 'Protection cryptographique de vos domaines et clés d API avec restrictions d IP CIDR.',
      highlights: ['Signature RSA 2048-bit', 'Whitelist IP serveur', 'Scopes granulaires RBAC'],
      badge: 'Sécurité Bancaire',
    },
  ];

  return (
    <div className="pt-32 pb-24 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
          <Layers className="w-3.5 h-3.5" />
          <span>Hub des Fonctionnalités</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          La suite technologique complète pour vos emails transactionnels.
        </h1>
        <p className="text-base text-[#9CA3AF] leading-relaxed">
          Découvrez en détail chacune des innovations architecturales qui composent l'infrastructure TUMA Cloud.
        </p>
      </div>

      {/* Grid of Dedicated Feature Cards */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.path)}
                className="glass-panel p-7 rounded-3xl border border-[#1F2937] hover:border-[#10B981]/50 transition-all flex flex-col justify-between space-y-6 cursor-pointer group hover:-translate-y-1 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.border} border flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feat.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0B0F19] text-[#9CA3AF] border border-[#1F2937]">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#10B981] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
                      {feat.subtitle}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#1F2937]">
                    {feat.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-[#D1D5DB]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2 text-xs font-bold text-[#10B981] group-hover:translate-x-1 transition-transform">
                  <span>Explorer la documentation dédiée</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
