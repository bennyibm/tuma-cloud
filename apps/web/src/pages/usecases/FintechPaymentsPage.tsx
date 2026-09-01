import React from 'react';
import {
  CreditCard,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Smartphone,
  Copy,
  Terminal,
  Activity,
  FileCheck,
} from 'lucide-react';

export const FintechPaymentsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold shadow-glow-emerald">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cas d'Usage FinTech & Passerelles de Paiement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Reçus de Paiement Mobile Money & Preuves de Transaction Sub-38ms.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Pour les passerelles de paiement, les portefeuilles électroniques (Wallets) et les agrégateurs de Mobile Money (Vodacom M-Pesa, Orange Money, Airtel Money), l'envoi du reçu de transaction est une obligation légale et le pilier de la confiance client.
          </p>
        </div>

        {/* Problem vs Solution Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-3xl bg-[#111827]/40 border border-red-500/30 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <span>Le Défi des Serveurs Traditionnels</span>
            </div>
            <ul className="text-xs text-[#9CA3AF] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>Latence d'envoi de 5 à 45 secondes bloquant l'application mobile de l'acheteur.</li>
              <li>Reçus classés en courrier indésirable (Spam) faute de signature DKIM valide sur le domaine.</li>
              <li>Litiges et charge de support client coûteuse pour confirmer les retraits M-Pesa.</li>
              <li>Impossibilité d'émettre des factures et reçus libellés en Francs Congolais (CDF).</li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-[#111827]/80 border border-[#10B981]/40 space-y-4 shadow-glow-emerald">
            <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>La Solution TUMA Cloud</span>
            </div>
            <ul className="text-xs text-[#D1D5DB] space-y-2.5 list-disc pl-4 leading-relaxed">
              <li><strong className="text-white">Ingestion en 1.8ms</strong> : Libère instantanément le backend de paiement via HTTP 202.</li>
              <li><strong className="text-white">100% Inbox garanti</strong> sur Vodacom, Orange, Airtel, Gmail et Outlook.</li>
              <li><strong className="text-white">Preuve cryptographique horodatée</strong> opposable en cas de réclamation client.</li>
              <li><strong className="text-white">Support natif du CDF</strong> et des formats de devises régionales OHADA.</li>
            </ul>
          </div>
        </div>

        {/* Live Visual Email Mockup Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#1F2937] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1F2937]">
            <div>
              <h3 className="text-lg font-bold text-white">Anatomie d'un Reçu Mobile Money Haute Performance</h3>
              <p className="text-xs text-[#9CA3AF]">Généré via le moteur de templates Handlebars de TUMA</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] font-mono font-bold text-xs">
              Score Spam : 100/100
            </span>
          </div>

          <div className="max-w-md mx-auto bg-[#05070B] rounded-2xl border border-[#1F2937] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#10B981] text-white flex items-center justify-center font-black text-xs">
                  P
                </div>
                <span className="font-bold text-xs text-white">Kinshasa Pay Services</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] font-bold">REÇU VALIDÉ ✓</span>
            </div>

            <div className="space-y-1 text-center py-2">
              <span className="text-xs text-[#9CA3AF]">Montant Prélevé</span>
              <div className="text-3xl font-black text-white font-mono">75,000 CDF</div>
              <span className="text-[11px] text-[#6B7280]">Vodacom M-Pesa • Ref: MP-849204</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1F2937] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Destinataire :</span>
                <span className="text-white">Supermarché Express Gombe</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Horodatage :</span>
                <span className="text-white">27 Août 2026, 16:14:02 UTC+1</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Frais de transfert :</span>
                <span className="text-[#10B981]">0 CDF (Offerts)</span>
              </div>
            </div>

            <div className="text-[10px] text-center text-[#6B7280]">
              Signé cryptographiquement par <code>mail.kinshasapay.cd</code> (RSA 2048-bit)
            </div>
          </div>
        </div>

        {/* Integration Code Snippet */}
        <div className="bg-[#0B0F19] rounded-2xl border border-[#1F2937] p-6 space-y-3 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2937] text-white font-bold">
            <span>Exemple d'Appel API : Envoi de Reçu Transactionnel</span>
            <span className="text-[#10B981]">TypeScript SDK</span>
          </div>
          <pre className="text-[#34D399] leading-relaxed overflow-x-auto">
            <code>{`const response = await tuma.emails.send({
  from: 'Kinshasa Pay <receipts@kinshasapay.cd>',
  to: ['client@banque.cd'],
  subject: 'Reçu de paiement #MP-849204 — 75,000 CDF',
  template: 'mpesa-receipt-v2',
  variables: {
    amount: '75,000',
    currency: 'CDF',
    provider: 'Vodacom M-Pesa',
    merchant: 'Supermarché Express Gombe',
    reference: 'MP-849204'
  },
  // Sécurisation contre les doublons bancaires
  idempotencyKey: 'tx_mpesa_849204_prod'
});`}</code>
          </pre>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#10B981]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-emerald">
          <div>
            <h3 className="text-xl font-bold text-white">Intégrez TUMA à votre passerelle FinTech</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Créez votre compte développeur ou parlez à notre équipe de Kinshasa.</p>
          </div>
          <a
            href="http://localhost:5173/register"
            className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Démarrer Gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
