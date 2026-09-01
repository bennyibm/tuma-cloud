import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Activity,
  Radio,
  Zap,
  ShieldCheck,
  MessageSquare,
  Clock,
  ArrowLeft,
  Bell,
  RefreshCw,
} from 'lucide-react';

export const StatusPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [lastCheck, setLastCheck] = useState<string>('À l instant');

  const subsystems = [
    {
      name: 'Cluster d Ingestion API (REST HTTPS)',
      location: 'Kinshasa & Edge Global',
      uptime: '100.0%',
      latency: '1.8 ms',
      status: 'Opérationnel',
      icon: Zap,
      color: 'text-[#10B981]',
    },
    {
      name: 'Relais SMTP & Signature DKIM RSA 2048',
      location: 'Nœud Haute Cadence',
      uptime: '99.99%',
      latency: '34 ms',
      status: 'Opérationnel',
      icon: ShieldCheck,
      color: 'text-[#10B981]',
    },
    {
      name: 'Passerelle de Secours WhatsApp & SMS (+243)',
      location: 'Failover Télécoms',
      uptime: '100.0%',
      latency: '1.2 sec',
      status: 'Opérationnel',
      icon: MessageSquare,
      color: 'text-[#FF6B00]',
    },
    {
      name: 'Interconnexion FAI (Vodacom, Orange, Airtel)',
      location: 'Liaison Directe RDC',
      uptime: '99.98%',
      latency: '24 ms',
      status: 'Opérationnel',
      icon: Radio,
      color: 'text-[#06B6D4]',
    },
    {
      name: 'Files Asynchrones BullMQ & Redis 7.2',
      location: 'Cluster Sharded',
      uptime: '100.0%',
      latency: '< 1 ms',
      status: 'Opérationnel',
      icon: Activity,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
            <span>Vérification temps réel : {lastCheck}</span>
          </div>
        </div>

        {/* Global Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#10B981]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-emerald">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#10B981]/20 text-[#10B981] flex items-center justify-center border border-[#10B981]/40 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Tous les Systèmes sont Opérationnels
              </h1>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Disponibilité globale constatée sur les 90 derniers jours : <strong className="text-[#10B981]">99.99%</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Vous recevrez les alertes statut par email.')}
            className="px-5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-bold border border-[#1F2937] flex items-center gap-2"
          >
            <Bell className="w-3.5 h-3.5 text-[#10B981]" />
            <span>S'abonner aux Alertes</span>
          </button>
        </div>

        {/* Subsystems List */}
        <div className="glass-panel rounded-3xl border border-[#1F2937] overflow-hidden shadow-2xl divide-y divide-[#1F2937]">
          <div className="px-6 py-4 bg-[#0B0F19] text-xs font-bold text-[#9CA3AF] flex items-center justify-between">
            <span>Composant Réseau</span>
            <span>Statut & Latence</span>
          </div>

          {subsystems.map((sub) => {
            const Icon = sub.icon;
            return (
              <div key={sub.name} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0B0F19] border border-[#1F2937] flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${sub.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{sub.name}</h3>
                    <span className="text-[11px] text-[#6B7280]">{sub.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-center font-mono text-xs">
                  <div className="text-right">
                    <div className="text-white font-bold">{sub.latency}</div>
                    <div className="text-[10px] text-[#6B7280]">{sub.uptime} Uptime</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] font-bold text-[11px] border border-[#10B981]/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>{sub.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 90-Day Uptime Visualization Grid */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#1F2937] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Historique de Disponibilité des 90 Derniers Jours</span>
            <span className="font-mono text-[#10B981] font-bold">100.0% Uptime</span>
          </div>

          {/* 90 bars */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(6px,1fr))] gap-1 py-2">
            {[...Array(90)].map((_, i) => (
              <div
                key={i}
                title={`Jour -${89 - i} : 100% Uptime`}
                className="h-9 bg-[#10B981] hover:bg-[#34D399] rounded-sm transition-colors cursor-pointer"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-mono">
            <span>Il y a 90 jours</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        {/* Incident History Log */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Historique Récent des Incidents</h3>
          <div className="p-6 rounded-2xl bg-[#05070B] border border-[#1F2937] text-xs text-[#9CA3AF] space-y-2">
            <div className="flex items-center justify-between text-white font-semibold">
              <span>Aucun incident majeur à signaler</span>
              <span className="font-mono text-[#10B981] text-[11px]">Tous les systèmes opérationnels</span>
            </div>
            <p>
              Toutes les opérations d'ingestion d'emails, de relais SMTP et de bascule WhatsApp s'exécutent avec des métriques de latence nominales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
