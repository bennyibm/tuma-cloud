import React from 'react';
import {
  BarChart3,
  Mail,
  Globe,
  Key,
  CreditCard,
  Send,
  FileCode,
  ShieldAlert,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavigationTab =
  | 'overview'
  | 'emails'
  | 'domains'
  | 'webhooks'
  | 'suppressions'
  | 'templates'
  | 'playground'
  | 'billing'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  emailCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, emailCount = 5 }) => {
  const { organization } = useAuth();
  const quota = organization?.monthlyQuota ?? 1000;
  const planName = organization?.plan ? `Plan ${organization.plan.charAt(0).toUpperCase() + organization.plan.slice(1)}` : 'Plan Gratuit';
  const menuItems = [
    { id: 'overview', label: "Vue d'Ensemble", icon: BarChart3, badge: 'Live' },
    { id: 'emails', label: 'Logs d Emails', icon: Mail, badge: `${emailCount}` },
    { id: 'templates', label: 'Modèles d Emails', icon: FileCode },
    { id: 'domains', label: 'Domaines & DKIM', icon: Globe },
    { id: 'suppressions', label: 'Suppressions & Bounces', icon: ShieldAlert },
    { id: 'playground', label: 'Playground d Envoi', icon: Send, special: true },
    { id: 'billing', label: 'Facturation & Mobile Money', icon: CreditCard },
    { id: 'settings', label: 'Paramètres & Équipe', icon: Settings },
    { id: 'webhooks', label: 'Webhooks & API Keys', icon: Key },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-[#1F2937] flex flex-col justify-between h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 flex items-center gap-3 border-b border-[#1F2937]/80">
          <img
            src="/tuma-icon.jpg"
            alt="Tuma Official Logo"
            className="w-9 h-9 rounded-xl shadow-glow-emerald shrink-0 border border-[#10B981]/30 object-cover"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">tuma</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                Cloud
              </span>
            </div>
            <p className="text-[11px] text-[#9CA3AF] truncate">Developer Email Platform</p>
          </div>
        </div>

        {/* Navigation Items (Zero-flicker fixed border box) */}
        <nav className="p-3 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] px-3 pt-2 pb-1.5">
            Plateforme
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id as NavigationTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border focus:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]/50 transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#1F2937] text-white border-[#374151] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#111827] border-transparent'
                } ${
                  item.special && !isActive
                    ? 'hover:border-[#FF6B00]/40 text-[#FFA057]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                      isActive
                        ? 'text-[#10B981]'
                        : item.special
                        ? 'text-[#FF6B00]'
                        : 'text-[#9CA3AF]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badge === 'Live'
                        ? 'bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-[#374151] text-[#D1D5DB]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quota & Organization Footer */}
      <div className="p-3 border-t border-[#1F2937]/80">
        <div className="bg-[#111827] rounded-xl p-3 border border-[#1F2937]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#9CA3AF]">Quota Mensuel</span>
            <span className="font-semibold text-white">0 / {quota.toLocaleString()}</span>
          </div>
          <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#10B981] to-[#06B6D4] h-1.5 rounded-full"
              style={{ width: '4%' }}
            />
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1F2937] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-[#10B981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{planName}</span>
            </div>
            <span className="text-[#6B7280]">Kinshasa DC</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
