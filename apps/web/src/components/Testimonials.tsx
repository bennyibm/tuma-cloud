import React from 'react';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Alexandre Mwamba',
      role: 'Lead Architect FinTech',
      company: 'Kinshasa Pay Services',
      avatar: '/tuma-icon.jpg',
      quote:
        'Avec TUMA, nos reçus de transaction M-Pesa arrivent en moins d une seconde dans la boîte principale de nos utilisateurs. La bascule WhatsApp en cas d absence de données mobiles a divisé par 10 nos tickets de support.',
    },
    {
      name: 'Grace Kalombo',
      role: 'Head of Engineering',
      company: 'AfriCargo Logistics',
      avatar: '/tuma-icon.jpg',
      quote:
        'Le Studio Visuel avec score anti-spam IA permet à nos équipes marketing et techniques de collaborer sur les mêmes templates sans risque de casser les variables d envoi ou le formatage mobile.',
    },
    {
      name: 'Christian Ilunga',
      role: 'CTO & Co-Founder',
      company: 'Banka RDC',
      avatar: '/tuma-icon.jpg',
      quote:
        'La compatibilité DKIM RSA 2048, les clés avec restriction d IP CIDR et le paiement en Francs Congolais via Mobile Money font de TUMA l infrastructure incontournable pour toute FinTech sérieuse en Afrique.',
    },
  ];

  return (
    <section className="py-24 bg-[#05070B] border-t border-[#1F2937] relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retours d'Expérience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Plébiscité par les bâtisseurs de la tech africaine.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-panel p-7 rounded-2xl border border-[#1F2937] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#FF6B00]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#D1D5DB] leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#1F2937] flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-xl object-cover border border-[#1F2937]" />
                <div>
                  <div className="font-bold text-xs text-white">{t.name}</div>
                  <div className="text-[11px] text-[#9CA3AF]">{t.role} • {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
