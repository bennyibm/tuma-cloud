import React from 'react';
import {
  Key,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Lock,
  Clock,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

export const BankingOtpPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => onNavigate('/use-cases')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux cas d'usage</span>
        </button>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 text-xs font-bold shadow-glow-cyber">
            <Key className="w-3.5 h-3.5" />
            <span>Cas d'Usage Banques & Authentification Forte 2FA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Codes OTP 2FA & Alertes de Fraude Délivrés en Moins de 3 Secondes.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Dans le secteur bancaire et la finance numérique, un code d'authentification à deux facteurs qui met plus de 10 secondes à arriver engendre l'abandon immédiat de la transaction par l'utilisateur. TUMA garantit un acheminement ultra-prioritaire avec bascule automatique sur WhatsApp.
          </p>
        </div>

        {/* 3 Critical Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Clock className="w-6 h-6 text-[#06B6D4]" />
            <h3 className="font-bold text-white text-base">Vitesse d'Acheminement Sub-3s</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Les jobs étiquetés <code>priority: critical</code> contournent les files standards et sont envoyés immédiatement aux serveurs de messagerie sans file d'attente.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <MessageSquare className="w-6 h-6 text-[#FF6B00]" />
            <h3 className="font-bold text-white text-base">Bascule WhatsApp / SMS</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Si le client n'a pas accès à sa boîte mail (ex: pas de données mobiles), le code OTP est retransmis automatiquement par WhatsApp sur son numéro congolais (+243).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Lock className="w-6 h-6 text-[#10B981]" />
            <h3 className="font-bold text-white text-base">Conformité Instruction BCC</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Respect intégral des normes de la Banque Centrale du Congo relatives à la traçabilité des opérations de paiement électronique et l'authentification forte.
            </p>
          </div>
        </div>

        {/* Visual Mockup Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#1F2937] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2937]">
            <div>
              <h3 className="text-lg font-bold text-white">Exemple d'Alerte de Sécurité & Validation de Virement</h3>
              <p className="text-xs text-[#9CA3AF]">Acheminé en 1.4 seconde via le cluster TUMA Cloud</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] font-mono font-bold text-xs">
              Priorité : CRITICAL (OTP)
            </span>
          </div>

          <div className="max-w-md mx-auto bg-[#05070B] rounded-2xl border border-[#1F2937] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <span className="font-bold text-xs text-white">Banka RDC — Sécurité Opérations</span>
              <span className="text-[10px] text-[#9CA3AF]">Reçu à l'instant</span>
            </div>

            <div className="space-y-3 text-center py-2">
              <span className="text-xs text-[#9CA3AF]">Code d'Autorisation Unique</span>
              <div className="text-4xl font-black text-[#06B6D4] font-mono tracking-widest bg-[#0B0F19] py-3 rounded-xl border border-[#1F2937]">
                849 201
              </div>
              <p className="text-[11px] text-[#EF4444] font-semibold">
                ⚠️ Ce code expire dans 5 minutes. Ne le communiquez à personne.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F2937] text-xs font-mono text-[#9CA3AF] space-y-1">
              <div>Opération : <strong>Virement sortant 1,500 USD</strong></div>
              <div>Bénéficiaire : <strong>Mwamba Logistics SARL</strong></div>
              <div>Canal de secours : <strong>WhatsApp (+243819991234)</strong></div>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="bg-[#0B0F19] rounded-2xl border border-[#1F2937] p-6 space-y-3 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2937] text-white font-bold">
            <span>Envoi d'OTP avec Failover WhatsApp Automatique</span>
            <span className="text-[#06B6D4]">Node.js SDK</span>
          </div>
          <pre className="text-[#34D399] leading-relaxed overflow-x-auto">
            <code>{`await tuma.emails.send({
  from: 'Banka Sécurité <security@banka.cd>',
  to: ['client@entreprise.cd'],
  subject: 'Votre code de confirmation OTP : 849 201',
  template: 'banking-otp-2fa',
  variables: {
    otpCode: '849 201',
    action: 'Virement international',
    amount: '1,500 USD',
    expiresIn: '5 minutes'
  },
  // Bascule instantanée si le client n'a pas ouvert l'email sous 2 minutes
  fallback: {
    enabled: true,
    phone: '+243819991234',
    channel: 'whatsapp'
  },
  tags: [{ name: 'type', value: 'otp_2fa' }]
});`}</code>
          </pre>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#06B6D4]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-cyber">
          <div>
            <h3 className="text-xl font-bold text-white">Sécurisez vos transactions dès aujourd'hui</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">SLA 99.99% et assistance dédiée pour les institutions financières.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className="px-6 py-3 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Contacter l'Équipe Bancaire</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
