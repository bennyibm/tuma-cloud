import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Radio, CreditCard, ShieldCheck, Zap } from 'lucide-react';

export const FaqPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqs = [
    {
      category: 'telecom',
      question: 'Comment TUMA garantit-il 100% de délivrabilité sur Vodacom, Orange et Airtel ?',
      answer:
        'TUMA utilise un routage direct via des adresses IP préchauffées certifiées et surveille en continu la latence réseau vers les serveurs MX africains. De plus, notre fonctionnalité de bascule automatique bascule sur WhatsApp ou SMS si un email critique n est pas ouvert sous 5 minutes.',
    },
    {
      category: 'telecom',
      question: 'Quels formats de numéros sont acceptés pour la bascule WhatsApp / SMS ?',
      answer:
        'Tous les formats internationaux E.164 sont acceptés (ex: +243819991234 pour la RDC, +254 pour le Kenya, +234 pour le Nigéria). Le numéro est transmis directement dans la propriété "fallback" lors de l appel API POST /v1/emails.',
    },
    {
      category: 'billing',
      question: 'Puis-je payer mon abonnement en Francs Congolais (CDF) par Mobile Money ?',
      answer:
        'Oui, absolument ! TUMA accepte nativement les paiements par Vodacom M-Pesa, Orange Money et Airtel Money au taux officiel de 2800 CDF pour 1 USD, sans frais de change cachés. Les factures conformes OHADA avec TVA sont téléchargeables directement sur votre tableau de bord.',
    },
    {
      category: 'security',
      question: 'Comment fonctionnent les clés API avec restriction d IP (CIDR) ?',
      answer:
        'Lors de la création d une clé secrète (sk_live_...), vous pouvez spécifier une adresse IP unique ou un masque de sous-réseau (ex: 197.234.218.42/32). Toute requête HTTP provenant d une autre adresse IP sera immédiatement rejetée avec une erreur 403 Forbidden.',
    },
    {
      category: 'performance',
      question: 'Quelle est la différence entre l envoi synchrone et l ingestion asynchrone ?',
      answer:
        'Avec l ingestion asynchrone de TUMA, votre serveur reçoit un code HTTP 202 Accepted en moins de 38ms (généralement 1.8ms), libérant immédiatement votre thread applicatif. BullMQ et Redis se chargent ensuite de la signature DKIM et de la transmission SMTP en parallèle.',
    },
    {
      category: 'security',
      question: 'Est-il obligatoire d ajouter des enregistrements DNS DKIM et SPF ?',
      answer:
        'Oui, pour expédier depuis votre propre nom de domaine (ex: @mon-entreprise.cd), vous devez ajouter les enregistrements CNAME/TXT fournis par TUMA. Cela garantit une signature RSA 2048-bit infalsifiable et évite que vos emails soient classés en spam.',
    },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Foire Aux Questions</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Tout ce que vous devez savoir sur TUMA.
          </h1>
          <p className="text-base text-[#9CA3AF]">
            Des réponses précises à vos questions techniques, de facturation et de délivrabilité.
          </p>

          {/* Search Input */}
          <div className="relative max-w-lg mx-auto pt-4">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une question (ex: Mobile Money, DKIM, WhatsApp, Latence...)"
              className="w-full bg-[#0B0F19] text-xs text-white pl-11 pr-4 py-3 rounded-2xl border border-[#1F2937] focus:outline-none focus:border-[#10B981] shadow-xl"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'Toutes les questions' },
              { id: 'telecom', label: 'Télécoms & FAI' },
              { id: 'billing', label: 'Tarifs & Mobile Money' },
              { id: 'security', label: 'Sécurité & DKIM' },
              { id: 'performance', label: 'Performance & API' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                    : 'bg-[#111827] text-[#9CA3AF] hover:text-white border border-[#1F2937]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="glass-panel rounded-2xl border border-[#1F2937] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-bold text-sm text-white">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#10B981] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs text-[#D1D5DB] leading-relaxed border-t border-[#1F2937]/50 pt-4 bg-[#05070B]/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="p-8 rounded-3xl bg-[#111827] border border-[#1F2937] text-center space-y-4">
          <h3 className="text-lg font-bold text-white">Vous avez une question spécifique ?</h3>
          <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
            Notre équipe d'ingénieurs en RDC et à l'international est disponible pour vous accompagner.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-glow-emerald"
          >
            Contacter notre Équipe Technique
          </button>
        </div>
      </div>
    </div>
  );
};
