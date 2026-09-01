import React, { useState } from 'react';
import { Check, ArrowRight, CreditCard, Smartphone, Zap, Shield, Sparkles, HelpCircle } from 'lucide-react';
import { PricingCalculator } from '../components/PricingCalculator';

export const PricingPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [sliderVolume, setSliderVolume] = useState<number>(50000);
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const rate = 2800;

  const calculateCustomPrice = (volume: number) => {
    if (volume <= 3000) return 0;
    if (volume <= 20000) return 15;
    if (volume <= 100000) return 49;
    if (volume <= 500000) return 149;
    return Math.round(149 + ((volume - 500000) / 100000) * 25);
  };

  const currentPriceUsd = calculateCustomPrice(sliderVolume);
  const formattedPrice =
    currentPriceUsd === 0
      ? 'Gratuit'
      : currency === 'USD'
      ? `$${currentPriceUsd} / mois`
      : `${(currentPriceUsd * rate).toLocaleString()} CDF / mois`;

  const comparisonRows = [
    { feature: 'Emails transactionnels mensuels', free: '3 000', starter: '20 000', pro: '100 000', scale: '500 000+' },
    { feature: 'Vitesse d ingestion sub-38ms', free: '✓', starter: '✓', pro: '✓', scale: '✓' },
    { feature: 'Domaines d expédition vérifiés', free: '1 domaine', starter: '3 domaines', pro: 'Illimités', scale: 'Illimités' },
    { feature: 'Signatures DKIM RSA 2048 & SPF', free: '✓', starter: '✓', pro: '✓', scale: '✓' },
    { feature: 'Studio Visuel & Templates Pro', free: 'Basique', starter: '✓', pro: '✓', scale: '✓' },
    { feature: 'Score Anti-Spam IA en Direct', free: '—', starter: '✓', pro: '✓', scale: '✓' },
    { feature: 'Bascule SMS & WhatsApp Fallback', free: '—', starter: '—', pro: '✓', scale: '✓' },
    { feature: 'Radar FAI (Vodacom, Airtel, Orange)', free: '—', starter: '—', pro: '✓', scale: '✓' },
    { feature: 'Clés API avec restriction d IP CIDR', free: '—', starter: '✓', pro: '✓', scale: '✓' },
    { feature: 'Adresse IP Dédiée Chaude', free: '—', starter: '—', pro: 'Optionnel', scale: 'Incluse' },
    { feature: 'SLA de Disponibilité', free: '99.5%', starter: '99.9%', pro: '99.95%', scale: '99.99%' },
    { feature: 'Support Technique', free: 'Communauté', starter: 'Email 24h', pro: 'Prioritaire 2h', scale: 'Ingénieur Dédié' },
  ];

  return (
    <div className="pt-32 pb-24 space-y-20">
      {/* Standard Pricing Component */}
      <PricingCalculator />

      {/* Interactive Volume Simulator */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#1F2937] space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
              <Zap className="w-3.5 h-3.5" />
              <span>Simulateur de Volume Personnalisé</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Estimez le coût exact selon votre trafic.
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Glissez le curseur pour simuler votre consommation mensuelle d'emails.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-sm text-[#9CA3AF]">Volume mensuel estimé :</span>
              <span className="text-2xl font-black text-white">
                {sliderVolume.toLocaleString()} emails
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="1000000"
              step="5000"
              value={sliderVolume}
              onChange={(e) => setSliderVolume(Number(e.target.value))}
              className="w-full h-2.5 bg-[#0B0F19] rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />

            <div className="flex justify-between text-[11px] font-mono text-[#6B7280]">
              <span>1 000 / mois</span>
              <span>250 000</span>
              <span>500 000</span>
              <span>1 000 000+ / mois</span>
            </div>

            {/* Live Computed Price Box */}
            <div className="p-6 rounded-2xl bg-[#05070B] border border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#9CA3AF]">Tarif mensuel calculé :</span>
                <div className="text-3xl font-black text-[#10B981] font-mono">{formattedPrice}</div>
              </div>
              <a
                href="http://localhost:5173/register"
                className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-glow-emerald flex items-center gap-2"
              >
                <span>Souscrire ce Forfait</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Tableau Comparatif des Fonctionnalités
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Comparez en détail les spécifications techniques de chaque forfait TUMA Cloud.
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-[#1F2937] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0F19] text-white border-b border-[#1F2937]">
                  <th className="p-4 font-bold">Fonctionnalité</th>
                  <th className="p-4 font-bold text-center">Free</th>
                  <th className="p-4 font-bold text-center">Starter</th>
                  <th className="p-4 font-bold text-center text-[#10B981]">Pro FinTech</th>
                  <th className="p-4 font-bold text-center">Scale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-[#D1D5DB]">
                {comparisonRows.map((row, idx) => (
                  <tr key={row.feature} className={idx % 2 === 0 ? 'bg-transparent' : 'bg-[#111827]/30'}>
                    <td className="p-4 font-semibold text-white">{row.feature}</td>
                    <td className="p-4 text-center font-mono">{row.free}</td>
                    <td className="p-4 text-center font-mono">{row.starter}</td>
                    <td className="p-4 text-center font-mono text-[#10B981] font-bold bg-[#10B981]/5">{row.pro}</td>
                    <td className="p-4 text-center font-mono">{row.scale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
