import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Phone, Building, Globe, ArrowRight } from 'lucide-react';
import { ENV } from '../config/env';

export const ContactPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [volume, setVolume] = useState('100,000 - 500,000 / mois');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct API email trigger
      await fetch(`${ENV.API_BASE_URL}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer sk_live_test',
        },
        body: JSON.stringify({
          from: 'Tuma Contact <contact@tuma.dev>',
          to: ['benny@tuma.dev'],
          subject: `Demande Contact Entreprise : ${company || name}`,
          html: `<div style="background:#0B0F19;color:#fff;padding:24px;border-radius:12px;"><h2>Nouvelle Demande Entreprise</h2><p><strong>Nom :</strong> ${name}</p><p><strong>Email :</strong> ${email}</p><p><strong>Société :</strong> ${company}</p><p><strong>Volume estimé :</strong> ${volume}</p><p><strong>Message :</strong> ${message}</p></div>`,
          tags: [{ name: 'source', value: 'landing_contact_page' }],
        }),
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#10B981]/30 text-xs font-semibold text-[#10B981]">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact & Entreprise</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Parlons de vos besoins d'infrastructure.
          </h1>
          <p className="text-base text-[#9CA3AF]">
            Que vous soyez une startup en amorçage ou une institution financière de premier plan, notre équipe d'ingénieurs est à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-8">
          {/* Left Column: Coordinates */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-[#1F2937] space-y-4">
              <h3 className="text-lg font-bold text-white">Bureaux & Support Dédié</h3>

              <div className="space-y-4 text-xs text-[#9CA3AF]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Kinshasa Gombe (Siège RDC)</span>
                    <span>Boulevard du 30 Juin, Commune de la Gombe, RDC</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Cluster Technique & Edge Relays</span>
                    <span>Kinshasa • Nairobi • Paris • Francfort</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Support Technique 24/7</span>
                    <span>engineering@tuma.dev • support@tuma.dev</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#05070B] border border-[#1F2937] space-y-2 text-xs">
              <span className="font-bold text-[#10B981] font-mono">SLA & Facturation OHADA :</span>
              <p className="text-[#9CA3AF] leading-relaxed">
                Nos contrats Entreprise incluent une facturation officielle en Francs Congolais (CDF) ou Dollars (USD), un accord de niveau de service (SLA 99.99%) et un canal Slack / WhatsApp dédié avec nos ingénieurs.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#1F2937] shadow-2xl">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto border border-[#10B981]/40 shadow-glow-emerald">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Transmis avec Succès !</h3>
                  <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                    Un ingénieur de solutions TUMA Cloud a bien reçu votre demande et vous contactera sous 2 heures ouvrées.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setCompany('');
                      setMessage('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#111827] text-xs font-semibold text-white border border-[#1F2937] hover:bg-[#1F2937]"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#9CA3AF] mb-1">Votre Nom & Prénom *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alexandre Mwamba"
                        required
                        className="w-full bg-[#0B0F19] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#9CA3AF] mb-1">Email Professionnel *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alexandre@banque.cd"
                        required
                        className="w-full bg-[#0B0F19] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-[#9CA3AF] mb-1">Nom de l'Entreprise / Startup</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Kinshasa FinTech SAS"
                        className="w-full bg-[#0B0F19] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#9CA3AF] mb-1">Volume Mensuel Estimé</label>
                      <select
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        className="w-full bg-[#0B0F19] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                      >
                        <option value="10,000 - 50,000 / mois">10 000 - 50 000 emails / mois</option>
                        <option value="50,000 - 200,000 / mois">50 000 - 200 000 emails / mois</option>
                        <option value="200,000 - 1,000,000 / mois">200 000 - 1 000 000 emails / mois</option>
                        <option value="1,000,000+ / mois (Banques & Télécoms)">1 000 000+ / mois (Banques & Télécoms)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#9CA3AF] mb-1">Votre Message ou Cas d'Usage *</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Expliquez-nous votre projet (ex: reçus OTP Mobile Money, intégration bancaire...)"
                      required
                      className="w-full bg-[#0B0F19] text-white px-3.5 py-2.5 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#6B7280]">Réponse garantie sous 2 heures</span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold shadow-glow-emerald flex items-center gap-2 transition-all"
                    >
                      <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>{loading ? 'Transmission...' : 'Envoyer la Demande'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
