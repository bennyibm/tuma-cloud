import React, { useState } from 'react';
import {
  Radio,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  MessageSquare,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
} from 'lucide-react';

export const ISPRadarWidget: React.FC = () => {
  const [selectedIsp, setSelectedIsp] = useState<string>('vodacom');
  const [whatsappFallbackActive, setWhatsappFallbackActive] = useState(true);
  const [fallbackNumber, setFallbackNumber] = useState('+243 81 999 1234');
  const [fallbackDelayMinutes, setFallbackDelayMinutes] = useState('3');

  const ispData = [
    {
      id: 'vodacom',
      name: 'Vodacom RDC (M-Pesa)',
      domain: '@vodacom.cd',
      inboxRate: 99.9,
      latencyMs: 24,
      status: 'optimal',
      marketShare: '38%',
      tls: 'TLS 1.3 AES-256',
      badge: 'RDC & Afrique Centrale',
    },
    {
      id: 'orange',
      name: 'Orange RDC (Money)',
      domain: '@orange.cd',
      inboxRate: 99.8,
      latencyMs: 28,
      status: 'optimal',
      marketShare: '31%',
      tls: 'TLS 1.3 Chacha20',
      badge: 'RDC & Sahel',
    },
    {
      id: 'airtel',
      name: 'Airtel Africa',
      domain: '@airtel.cd',
      inboxRate: 99.7,
      latencyMs: 31,
      status: 'optimal',
      marketShare: '26%',
      tls: 'TLS 1.2 RSA',
      badge: 'Afrique Subsaharienne',
    },
    {
      id: 'starlink',
      name: 'Starlink & Liquid Telecom',
      domain: 'Backbone Entreprise',
      inboxRate: 100.0,
      latencyMs: 19,
      status: 'optimal',
      marketShare: '5%',
      tls: 'TLS 1.3 Quantum-Ready',
      badge: 'Fibre & Satellite',
    },
    {
      id: 'gmail',
      name: 'Google Gmail',
      domain: '@gmail.com',
      inboxRate: 99.6,
      latencyMs: 35,
      status: 'optimal',
      marketShare: 'International',
      tls: 'TLS 1.3 TLS_AES',
      badge: 'Mondial',
    },
  ];

  const currentIsp = ispData.find((i) => i.id === selectedIsp) || ispData[0];

  return (
    <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#10B981] animate-pulse" />
            <h3 className="text-base font-bold text-white">Radar de Délivrabilité FAI & Télécoms</h3>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              Live Radar
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Surveillance en temps réel de la réputation IP et de la délivrabilité boîte de réception (100% Inbox) par opérateur en RDC et à l'international.
          </p>
        </div>
      </div>

      {/* Grid of ISPs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ispData.map((isp) => (
          <div
            key={isp.id}
            onClick={() => setSelectedIsp(isp.id)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedIsp === isp.id
                ? 'bg-[#0B0F19] border-[#10B981] ring-1 ring-[#10B981]/40 shadow-glow-emerald'
                : 'bg-[#0B0F19]/60 hover:bg-[#0B0F19] border-[#1F2937]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate">{isp.name.split(' ')[0]}</span>
              <span className="text-[11px] font-mono text-[#10B981] font-bold">{isp.inboxRate}%</span>
            </div>
            <div className="text-[10px] text-[#9CA3AF] mt-1">{isp.domain}</div>
            <div className="mt-2 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[10px] text-[#6B7280]">
              <span>Latence: {isp.latencyMs}ms</span>
              <span className="text-[#10B981]">● Inbox</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Card for Selected ISP */}
      <div className="bg-[#0B0F19] rounded-xl p-5 border border-[#1F2937] flex flex-col lg:flex-row items-center justify-between gap-5">
        <div className="space-y-2 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-white">{currentIsp.name}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1F2937] text-[#9CA3AF] border border-[#374151]">
              {currentIsp.badge}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
            <span>Taux Inbox : <strong className="text-[#10B981]">{currentIsp.inboxRate}%</strong></span>
            <span>Latence RTT : <strong className="text-white font-mono">{currentIsp.latencyMs} ms</strong></span>
            <span>Chiffrement : <strong className="text-[#06B6D4] font-mono">{currentIsp.tls}</strong></span>
          </div>
        </div>

        {/* Omnichannel WhatsApp / SMS Fallback Config */}
        <div className="bg-[#111827] p-4 rounded-xl border border-[#1F2937] w-full lg:w-auto space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-white">Bascule Omnicanale SMS / WhatsApp</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappFallbackActive}
                onChange={(e) => setWhatsappFallbackActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#1F2937] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]" />
            </label>
          </div>

          <p className="text-[11px] text-[#9CA3AF]">
            Si l'email transactionnel n'est pas ouvert sous {fallbackDelayMinutes} minutes, un SMS/WhatsApp est automatiquement acheminé.
          </p>
        </div>
      </div>
    </div>
  );
};
