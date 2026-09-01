import React from 'react';
import { Terminal, Code, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const DeveloperQuickstart: React.FC = () => {
  return (
    <section id="developers" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#06B6D4]/30 text-xs font-semibold text-[#06B6D4]">
            <Code className="w-3.5 h-3.5" />
            <span>Intégration Développeur</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Prêt pour la production en 3 étapes simples.
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Intégrez vos premiers envois transactionnels en moins de 2 minutes avec notre SDK TypeScript officiel.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="glass-panel p-7 rounded-2xl border border-[#1F2937] space-y-4">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] font-mono font-bold flex items-center justify-center border border-[#10B981]/30">
              01
            </div>
            <h3 className="font-bold text-base text-white">Installez le SDK</h3>
            <p className="text-xs text-[#9CA3AF]">
              Compatible Node.js, Next.js, Remix, Deno, Bun et tous les runtimes Edge modernes.
            </p>
            <pre className="p-3 bg-[#05070B] rounded-xl text-xs font-mono text-[#34D399] border border-[#1F2937]">
              npm install @tuma/sdk
            </pre>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-7 rounded-2xl border border-[#1F2937] space-y-4">
            <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] font-mono font-bold flex items-center justify-center border border-[#06B6D4]/30">
              02
            </div>
            <h3 className="font-bold text-base text-white">Ajoutez votre Clé API</h3>
            <p className="text-xs text-[#9CA3AF]">
              Générez votre clé secrète avec restriction d'IP directement depuis votre tableau de bord.
            </p>
            <pre className="p-3 bg-[#05070B] rounded-xl text-xs font-mono text-[#06B6D4] border border-[#1F2937]">
              TUMA_API_KEY=sk_live_...
            </pre>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-7 rounded-2xl border border-[#1F2937] space-y-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00] font-mono font-bold flex items-center justify-center border border-[#FF6B00]/30">
              03
            </div>
            <h3 className="font-bold text-base text-white">Expédiez en Direct</h3>
            <p className="text-xs text-[#9CA3AF]">
              Délivrez vos reçus avec signature DKIM RSA 2048 et suivez le statut en direct.
            </p>
            <pre className="p-3 bg-[#05070B] rounded-xl text-xs font-mono text-[#FF6B00] border border-[#1F2937]">
              await tuma.emails.send(...)
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};
