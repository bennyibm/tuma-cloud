import React from 'react';
import { Hero } from '../components/Hero';
import { NetworkBanner } from '../components/NetworkBanner';
import { FeatureShowcase } from '../components/FeatureShowcase';
import { RadarSection } from '../components/RadarSection';
import { LiveSandbox } from '../components/LiveSandbox';
import { PricingCalculator } from '../components/PricingCalculator';
import { DeveloperQuickstart } from '../components/DeveloperQuickstart';
import { Testimonials } from '../components/Testimonials';
import {
  CreditCard,
  Key,
  ShoppingBag,
  Rocket,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Cpu,
  Lock,
} from 'lucide-react';

export const HomePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const quickUseCases = [
    {
      title: 'Reçus Mobile Money',
      desc: 'Vodacom M-Pesa, Orange Money & Airtel Money expédiés sous 38ms.',
      icon: CreditCard,
      path: '/use-cases/fintech-payments',
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/15',
    },
    {
      title: 'Codes OTP 2FA Sub-3s',
      desc: 'Authentification bancaire avec bascule automatique WhatsApp.',
      icon: Key,
      path: '/use-cases/banking-otp',
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/15',
    },
    {
      title: 'E-commerce & Livraison',
      desc: 'Suivi de colis coursier et facturation fiscale OHADA.',
      icon: ShoppingBag,
      path: '/use-cases/ecommerce-logistics',
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FF6B00]/15',
    },
    {
      title: 'SaaS & Alertes DevOps',
      desc: 'Séquences d onboarding produit et alertes de monitoring cluster.',
      icon: Rocket,
      path: '/use-cases/saas-onboarding',
      color: 'text-purple-400',
      bg: 'bg-purple-500/15',
    },
  ];

  return (
    <div>
      <Hero />
      <NetworkBanner />

      {/* Featured Use Cases Quick Hub */}
      <section className="py-20 relative bg-[#05070B] border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#10B981] font-bold uppercase tracking-wider">
                Cas d'Usage Métiers
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight mt-1">
                Conçu pour les flux critiques de l'économie africaine.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/use-cases')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] hover:underline"
            >
              <span>Voir tous les cas d'usage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickUseCases.map((quc) => {
              const Icon = quc.icon;
              return (
                <div
                  key={quc.title}
                  onClick={() => onNavigate(quc.path)}
                  className="glass-panel p-6 rounded-2xl border border-[#1F2937] hover:border-[#10B981]/50 transition-all cursor-pointer group hover:-translate-y-1 space-y-4 shadow-xl"
                >
                  <div className={`w-10 h-10 rounded-xl ${quc.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${quc.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-[#10B981] transition-colors">
                      {quc.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">{quc.desc}</p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                    <span>En savoir plus</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FeatureShowcase />
      <RadarSection />
      <LiveSandbox />
      <PricingCalculator />
      <DeveloperQuickstart />
      <Testimonials />
    </div>
  );
};
