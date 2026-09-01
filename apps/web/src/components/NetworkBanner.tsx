import React from 'react';
import { Smartphone, CheckCircle2, Shield, Radio, Zap } from 'lucide-react';

export const NetworkBanner: React.FC = () => {
  const networks = [
    { name: 'Vodacom M-Pesa', region: 'RDC & Afrique Centrale', status: 'Optimal 24ms', color: 'text-red-400' },
    { name: 'Orange Money', region: 'RDC & Sahel', status: 'Optimal 28ms', color: 'text-orange-400' },
    { name: 'Airtel Money', region: 'Afrique Subsaharienne', status: 'Optimal 31ms', color: 'text-red-500' },
    { name: 'Rawbank / IllicoCash', region: 'FinTech & Banking', status: 'Inbox 100%', color: 'text-yellow-400' },
    { name: 'Starlink & Liquid', region: 'Fibre & Satellite', status: 'Sub-20ms Edge', color: 'text-cyan-400' },
  ];

  return (
    <section className="py-12 border-y border-[#1F2937] bg-[#05070B]/80">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase font-bold tracking-widest text-[#6B7280]">
            Connectivité Directe avec les Principaux Opérateurs & Écosystèmes de Paiement
          </p>
        </div>

        {/* Brand Logos / Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {networks.map((net) => (
            <div
              key={net.name}
              className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F2937] hover:border-[#374151] transition-all flex flex-col items-center text-center space-y-1 group"
            >
              <span className="font-bold text-sm text-white group-hover:text-[#10B981] transition-colors">
                {net.name}
              </span>
              <span className="text-[10px] text-[#6B7280]">{net.region}</span>
              <div className="pt-2 flex items-center gap-1 text-[11px] font-mono text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>{net.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
