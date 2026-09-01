import React from 'react';
import { Radio, CheckCircle2, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

export const RadarSection: React.FC = () => {
  const isps = [
    {
      name: 'Vodacom RDC (M-Pesa)',
      domain: '@vodacom.cd',
      inbox: 99.9,
      latency: '24ms',
      marketShare: '38%',
      security: 'TLS 1.3 AES-256',
      badge: 'Premier Opérateur RDC',
    },
    {
      name: 'Orange RDC (Money)',
      domain: '@orange.cd',
      inbox: 99.8,
      latency: '28ms',
      marketShare: '31%',
      security: 'TLS 1.3 Chacha20',
      badge: 'Kinshasa & Régions',
    },
    {
      name: 'Airtel Africa',
      domain: '@airtel.cd',
      inbox: 99.7,
      latency: '31ms',
      marketShare: '26%',
      security: 'TLS 1.2 RSA',
      badge: 'Panafricain',
    },
    {
      name: 'Starlink & Liquid Telecom',
      domain: 'Backbone Fibre & Sat',
      inbox: 100.0,
      latency: '19ms',
      marketShare: '5%',
      security: 'Quantum-Ready',
      badge: 'Backbone Haute Vitesse',
    },
  ];

  return (
    <section id="radar" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#06B6D4]/30 text-xs font-semibold text-[#06B6D4]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Radar Télécoms en Direct</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Surveillance & Réputation FAI en temps réel.
          </h2>
          <p className="text-sm text-[#9CA3AF]">
            Une connectivité calibrée pour éviter les filtres anti-spam et garantir la réception instantanée de vos codes critiques.
          </p>
        </div>

        {/* ISP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isps.map((isp) => (
            <div
              key={isp.name}
              className="glass-panel p-6 rounded-2xl border border-[#1F2937] hover:border-[#10B981]/50 transition-all space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9CA3AF] px-2 py-0.5 rounded bg-[#0B0F19] border border-[#1F2937]">
                  {isp.badge}
                </span>
                <span className="text-xs font-mono text-[#10B981] font-bold">
                  {isp.inbox}% Inbox
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#10B981] transition-colors">
                  {isp.name}
                </h3>
                <p className="text-xs font-mono text-[#6B7280]">{isp.domain}</p>
              </div>

              <div className="pt-3 border-t border-[#1F2937] space-y-2 text-xs text-[#9CA3AF]">
                <div className="flex items-center justify-between">
                  <span>Latence moyenne :</span>
                  <span className="font-mono text-white font-bold">{isp.latency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chiffrement :</span>
                  <span className="font-mono text-[#06B6D4]">{isp.security}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
