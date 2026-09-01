import React from 'react';
import { Zap, ArrowLeft, ArrowRight, CheckCircle2, Cpu, Activity, ShieldCheck, Terminal } from 'lucide-react';

export const SpeedPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold shadow-glow-emerald">
            <Zap className="w-3.5 h-3.5" />
            <span>Architecture Asynchrone BullMQ & Redis 7.2</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Ingestion Sub-38ms : L'email transactionnel à vitesse lumière.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Pour les FinTechs et applications bancaires, chaque milliseconde compte. TUMA sépare hermétiquement l'acceptation de la requête HTTP du processus lourd de distribution SMTP.
          </p>
        </div>

        {/* Latency Comparison Card */}
        <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
          <h3 className="text-lg font-bold text-white">Comparatif de Latence d'Ingestion API</h3>
          
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-white font-bold">
                <span className="text-[#10B981]">⚡ TUMA Cloud (Redis 7.2 BullMQ)</span>
                <span className="text-[#10B981]">1.8 ms (HTTP 202 Accepted)</span>
              </div>
              <div className="w-full bg-[#0B0F19] h-3 rounded-full overflow-hidden border border-[#1F2937]">
                <div className="bg-[#10B981] h-full rounded-full w-[8%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[#9CA3AF]">
                <span>Fournisseurs SMTP Traditionnels (Bloquants)</span>
                <span>450 - 1,200 ms</span>
              </div>
              <div className="w-full bg-[#0B0F19] h-3 rounded-full overflow-hidden border border-[#1F2937]">
                <div className="bg-[#EF4444]/60 h-full rounded-full w-[85%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Cpu className="w-6 h-6 text-[#10B981]" />
            <h4 className="font-bold text-white text-sm">Parallélisation Multicœur</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Les workers exécutent la signature cryptographique DKIM RSA 2048 et la compilation Handlebars en tâche de fond sans bloquer l'API.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Activity className="w-6 h-6 text-[#06B6D4]" />
            <h4 className="font-bold text-white text-sm">Idempotence O(1)</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Les clés d'idempotence (`Idempotency-Key`) garantissent qu'aucune transaction de paiement ou retrait bancaire n'est notifiée en double.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h4 className="font-bold text-white text-sm">Retry Exponentiel</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              En cas de greylisting ou de coupure réseau temporaire du FAI récepteur, TUMA retente automatiquement avec backoff exponentiel.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#10B981]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-emerald">
          <div>
            <h3 className="text-xl font-bold text-white">Prêt à accélérer vos envois ?</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Créez votre compte en 30 secondes et intégrez le SDK.</p>
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
