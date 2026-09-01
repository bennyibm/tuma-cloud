import React from 'react';
import { MessageSquare, ArrowLeft, ArrowRight, CheckCircle2, Smartphone, Zap, Clock, ShieldCheck } from 'lucide-react';

export const OmnichannelPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-xs font-bold shadow-glow-solar">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Bascule Omnicanale SMS / WhatsApp Fallback</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Ne perdez plus jamais une alerte critique en cas de coupure de données.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            En Afrique subsaharienne, les utilisateurs n'ont pas toujours un forfait data actif sur leur smartphone. Si un code OTP ou reçu de paiement n'est pas ouvert sous 5 minutes, TUMA bascule automatiquement la notification sur WhatsApp ou SMS (+243...).
          </p>
        </div>

        {/* Failover Lifecycle Flow */}
        <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
          <h3 className="text-lg font-bold text-white">Le Cycle de Bascule Automatique</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 rounded-2xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-[#10B981] font-bold flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#10B981]/20 flex items-center justify-center">1</span>
                <span>Envoi Transactionnel Email</span>
              </div>
              <p className="text-[#9CA3AF]">
                L'email est expédié instantanément avec tracking pixel et signature DKIM.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-[#FF6B00] font-bold flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center">2</span>
                <span>Minuteur de Délivrance</span>
              </div>
              <p className="text-[#9CA3AF]">
                TUMA surveille l'ouverture pendant le délai configuré (ex: 5 min).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-[#06B6D4] font-bold flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center">3</span>
                <span>Failover WhatsApp / SMS</span>
              </div>
              <p className="text-[#9CA3AF]">
                Si non ouvert, notification envoyée au +243... avec taux de lecture 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-[#0B0F19] rounded-2xl border border-[#1F2937] p-6 space-y-3 font-mono text-xs shadow-2xl">
          <div className="text-white font-bold flex items-center justify-between pb-2 border-b border-[#1F2937]">
            <span>Exemple d'Intégration WhatsApp Fallback</span>
            <span className="text-[#10B981]">Node.js / TypeScript</span>
          </div>
          <pre className="text-[#34D399] leading-relaxed overflow-x-auto">
            <code>{`await tuma.emails.send({
  from: 'Acme Pay <alert@mon-domaine.cd>',
  to: ['client@startup.cd'],
  subject: 'Votre code de sécurité OTP : 492019',
  html: '<p>Votre code OTP est <strong>492019</strong></p>',
  // Bascule automatique sur WhatsApp
  fallback: {
    enabled: true,
    phone: '+243819991234',
    channel: 'whatsapp'
  }
});`}</code>
          </pre>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#FF6B00]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-solar">
          <div>
            <h3 className="text-xl font-bold text-white">Sécurisez 100% de vos alertes critiques</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Disponible sur tous les forfaits Pro et Entreprise.</p>
          </div>
          <a
            href="http://localhost:5173/register"
            className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Activer la Bascule</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
