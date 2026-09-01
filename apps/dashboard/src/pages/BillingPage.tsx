import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  TrendingUp,
  Download,
  Receipt,
  ArrowRight,
  DollarSign,
  Coins,
  FileText,
  X,
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const [currency, setCurrency] = useState<'USD' | 'CDF'>('USD');
  const [selectedPackPriceUsd, setSelectedPackPriceUsd] = useState<number>(40);
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'orange' | 'airtel' | 'card'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('+243 81 234 5678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const EXCHANGE_RATE = 2800; // 1 USD = 2800 CDF

  const packs = [
    { emails: 10000, priceUsd: 10, label: 'Starter', popular: false },
    { emails: 50000, priceUsd: 40, label: 'Growth', popular: true },
    { emails: 200000, priceUsd: 140, label: 'Scale Up', popular: false },
  ];

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa (Vodacom)',
      badge: 'RDC & Afrique',
      color: 'border-red-500/40 text-red-400 bg-red-500/10',
    },
    {
      id: 'orange',
      name: 'Orange Money',
      badge: 'Instantané',
      color: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      badge: '0% frais',
      color: 'border-red-600/40 text-red-500 bg-red-600/10',
    },
    {
      id: 'card',
      name: 'Carte Visa / Mastercard',
      badge: 'International',
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
  ];

  const invoices = [
    {
      id: 'INV-2026-08-01',
      date: '27 Août 2026',
      amountUsd: 40,
      method: 'M-Pesa (+243 81***)',
      status: 'Payé 🟢',
      credits: '+50,000 Emails',
      nif: 'A1234567Z',
      rccm: 'CD/KIN/RCCM/24-B-01234',
    },
    {
      id: 'INV-2026-07-28',
      date: '28 Juillet 2026',
      amountUsd: 10,
      method: 'Orange Money (+243 89***)',
      status: 'Payé 🟢',
      credits: '+10,000 Emails',
      nif: 'A1234567Z',
      rccm: 'CD/KIN/RCCM/24-B-01234',
    },
  ];

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      const pack = packs.find((p) => p.priceUsd === selectedPackPriceUsd);
      setSuccessMessage(
        `✅ Paiement Mobile Money validé avec succès ! +${pack?.emails.toLocaleString()} crédits ajoutés à votre compte.`,
      );
    }, 1200);
  };

  const formatPrice = (usd: number) => {
    if (currency === 'USD') return `$${usd} USD`;
    return `${(usd * EXCHANGE_RATE).toLocaleString()} CDF`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] space-y-2">
          <span className="text-xs font-semibold text-[#9CA3AF]">Solde de Crédits Actuel</span>
          <div className="text-2xl font-extrabold text-white">8,750 Emails</div>
          <p className="text-[11px] text-[#10B981] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Sans date d'expiration
          </p>
        </div>

        <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] space-y-2">
          <span className="text-xs font-semibold text-[#9CA3AF]">Emails Envoyés ce Mois</span>
          <div className="text-2xl font-extrabold text-white">1,250</div>
          <p className="text-[11px] text-[#6B7280]">Renouvellement le 1er du mois</p>
        </div>

        {/* Currency Switcher Card */}
        <div className="bg-[#111827] rounded-xl p-5 border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9CA3AF]">Devise d'Affichage</span>
            <div className="flex items-center gap-1 bg-[#0B0F19] p-0.5 rounded-lg border border-[#1F2937]">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                  currency === 'USD' ? 'bg-[#10B981] text-white' : 'text-[#9CA3AF]'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('CDF')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                  currency === 'CDF' ? 'bg-[#FF6B00] text-white' : 'text-[#9CA3AF]'
                }`}
              >
                CDF (FC)
              </button>
            </div>
          </div>
          <div className="text-xl font-extrabold text-white">1 USD = 2,800 CDF</div>
          <p className="text-[11px] text-[#06B6D4]">Taux officiel Marché RDC</p>
        </div>
      </div>

      {/* Credit Purchase Section */}
      <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Recharge Instantanée de Crédits (Mobile Money)</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              Pay As You Go
            </span>
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Rechargez vos crédits d'envoi en direct par M-Pesa, Orange Money ou Airtel Money.
          </p>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <div
              key={pack.priceUsd}
              onClick={() => setSelectedPackPriceUsd(pack.priceUsd)}
              className={`rounded-xl p-5 border cursor-pointer transition-colors relative ${
                selectedPackPriceUsd === pack.priceUsd
                  ? 'bg-[#1F2937] border-[#10B981] shadow-glow-emerald'
                  : 'bg-[#0B0F19] border-[#1F2937] hover:border-[#374151]'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                  Recommandé
                </span>
              )}
              <div className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
                {pack.label}
              </div>
              <div className="text-xl font-black text-white">
                {pack.emails.toLocaleString()} <span className="text-xs font-normal text-[#9CA3AF]">emails</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#1F2937] flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-[#10B981]">
                  {formatPrice(pack.priceUsd)}
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  {currency === 'USD' ? `${(pack.priceUsd * EXCHANGE_RATE).toLocaleString()} CDF` : `$${pack.priceUsd} USD`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSimulatePayment} className="space-y-4 pt-4 border-t border-[#1F2937]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
            Moyen de Paiement RDC & International
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {paymentMethods.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMethod(m.id as any)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between text-xs ${
                  selectedMethod === m.id
                    ? 'bg-[#1F2937] border-white text-white font-semibold'
                    : 'bg-[#0B0F19] border-[#1F2937] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <span>{m.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${m.color}`}>
                  {m.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                Numéro Mobile Money (Vodacom / Orange / Airtel)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#0B0F19] text-xs text-white px-3.5 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-colors"
              >
                <Smartphone className={`w-4 h-4 ${isProcessing ? 'animate-bounce' : ''}`} />
                <span>
                  {isProcessing
                    ? 'Push USSD en cours...'
                    : `Valider le Paiement de ${formatPrice(selectedPackPriceUsd)}`}
                </span>
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Invoices History */}
      <div className="bg-[#111827] rounded-xl border border-[#1F2937] overflow-hidden">
        <div className="p-4 border-b border-[#1F2937] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#10B981]" /> Factures & Reçus Fiscaux RDC
          </h3>
        </div>

        <div className="divide-y divide-[#1F2937]">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-white">{inv.id}</div>
                <div className="text-[#6B7280]">
                  {inv.date} • {inv.method} • NIF : {inv.nif}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[#10B981] font-bold">{inv.credits}</span>
                <span className="text-white font-medium">{formatPrice(inv.amountUsd)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(inv)}
                  className="px-2.5 py-1 bg-[#1F2937] hover:bg-[#374151] rounded text-[#9CA3AF] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Reçu Fiscal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <div className="flex items-center gap-2">
                <img src="/tuma-icon.jpg" className="w-7 h-7 rounded-lg object-cover" />
                <span className="font-bold text-white">Facture Fiscale TUMA SAS</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0B0F19] rounded-xl p-4 border border-[#1F2937] space-y-2 text-xs">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Numéro de Facture :</span>
                <span className="font-mono text-white font-bold">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Date :</span>
                <span className="text-white">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Moyen de Paiement :</span>
                <span className="text-white">{selectedInvoice.method}</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>RCCM Kinshasa :</span>
                <span className="text-white">{selectedInvoice.rccm}</span>
              </div>
              <div className="flex justify-between text-[#9CA3AF]">
                <span>NIF Émetteur :</span>
                <span className="text-white">{selectedInvoice.nif}</span>
              </div>
              <div className="pt-2 border-t border-[#1F2937] flex justify-between font-bold text-sm text-[#10B981]">
                <span>Total TTC Réglé :</span>
                <span>{formatPrice(selectedInvoice.amountUsd)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => alert('Téléchargement PDF du reçu officiel généré !')}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#10B981] hover:bg-[#059669] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Reçu PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
