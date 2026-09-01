import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, Zap, Shield, CreditCard, Smartphone } from 'lucide-react';

export const PricingCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const rate = 2800; // 1 USD = 2800 CDF

  const formatPrice = (usd: number) => {
    if (usd === 0) return 'Gratuit';
    if (currency === 'USD') return `$${usd}`;
    return `${(usd * rate).toLocaleString()} CDF`;
  };

  const plans = [
    {
      name: 'Free Développeur',
      price: 0,
      period: '/mois',
      description: 'Idéal pour prototyper et tester vos intégrations en développement.',
      quota: '3,000 emails / mois',
      features: [
        'Ingestion asynchrone sub-38ms',
        '1 domaine d envoi vérifié',
        'DKIM RSA 2048 & SPF automatique',
        'Accès au Studio Visuel basique',
        'Rétention des logs : 3 jours',
      ],
      popular: false,
      cta: 'Commencer Gratuitement',
      href: 'http://localhost:5173/register',
    },
    {
      name: 'Starter FinTech',
      price: 15,
      period: '/mois',
      description: 'Pour les startups en croissance qui lancent leurs premiers services.',
      quota: '20,000 emails / mois',
      features: [
        'Tout le plan Free inclus',
        '3 domaines personnalisés',
        'Score Anti-Spam IA en direct',
        'Webhooks sortants avec rejeu',
        'Support prioritaire par email',
        'Rétention des logs : 15 jours',
      ],
      popular: false,
      cta: 'Choisir Starter',
      href: 'http://localhost:5173/register',
    },
    {
      name: 'Pro Entreprise',
      price: 49,
      period: '/mois',
      description: 'La formule plébiscitée par les banques, télécoms et FinTechs établies.',
      quota: '100,000 emails / mois',
      features: [
        'Tout le plan Starter inclus',
        'Domaines illimités avec DKIM dédié',
        'Bascule Omnicanale WhatsApp & SMS',
        'Radar FAI (Vodacom, Airtel, Orange)',
        'Clés API avec restrictions d IP (CIDR)',
        'Rétention des logs : 60 jours',
      ],
      popular: true,
      cta: 'Démarrer avec Pro',
      href: 'http://localhost:5173/register',
    },
    {
      name: 'Scale & Banques',
      price: 149,
      period: '/mois',
      description: 'Volume massif avec adresse IP dédiée et SLA de délivrabilité garanti.',
      quota: '500,000 emails / mois',
      features: [
        'Tout le plan Pro inclus',
        'Pool d adresses IP dédiées chaudes',
        'SLA de délivrabilité 99.99%',
        'Gestionnaire de compte technique dédié',
        'Facturation conforme OHADA',
        'Rétention des logs illimitée',
      ],
      popular: false,
      cta: 'Contacter l Équipe Scale',
      href: 'http://localhost:5173/register',
    },
  ];

  return (
    <section id="pricing" className="py-24 relative bg-[#05070B] border-t border-[#1F2937]">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarification Transparente</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Des tarifs prévisibles, payables en USD ou Mobile Money.
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Payez par carte bancaire internationale ou directement via M-Pesa, Orange Money et Airtel Money.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center gap-2 bg-[#111827] p-1.5 rounded-xl border border-[#1F2937] shadow-lg">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-[#10B981] text-white shadow-glow-emerald'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('CDF')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'CDF'
                  ? 'bg-[#FF6B00] text-white shadow-glow-solar'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              CDF (Franc Congolais)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#111827] to-[#0B0F19] border-2 border-[#10B981] shadow-glow-emerald scale-105 z-10'
                  : 'glass-panel border border-[#1F2937]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Recommandé FinTech
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-[#9CA3AF] mt-1">{plan.description}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{formatPrice(plan.price)}</span>
                    {plan.price > 0 && (
                      <span className="text-xs text-[#9CA3AF]">{plan.period}</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs font-mono text-[#10B981] font-semibold">
                    {plan.quota}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1F2937] space-y-2.5">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2 text-xs text-[#D1D5DB]">
                      <Check className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={plan.href}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-glow-emerald'
                      : 'bg-[#1F2937] hover:bg-[#374151] text-white'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Gateways Badges */}
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-[#1F2937] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#10B981]" />
            <span className="font-semibold text-white">Modes de paiement acceptés en RDC et à l'international :</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-semibold text-white">
            <span className="px-2.5 py-1 rounded bg-[#111827] border border-[#1F2937]">M-Pesa (Vodacom)</span>
            <span className="px-2.5 py-1 rounded bg-[#111827] border border-[#1F2937]">Orange Money</span>
            <span className="px-2.5 py-1 rounded bg-[#111827] border border-[#1F2937]">Airtel Money</span>
            <span className="px-2.5 py-1 rounded bg-[#111827] border border-[#1F2937]">Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </section>
  );
};
