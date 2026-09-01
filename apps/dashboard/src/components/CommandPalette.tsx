import React, { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Globe,
  Key,
  ShieldAlert,
  FileCode,
  Send,
  CreditCard,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: "Vue d'Ensemble", tab: 'overview', icon: Mail, group: 'Navigation' },
    { label: 'Logs d Emails', tab: 'emails', icon: Mail, group: 'Navigation' },
    { label: 'Modèles d Emails & Studio', tab: 'templates', icon: FileCode, group: 'Navigation' },
    { label: 'Domaines & DKIM', tab: 'domains', icon: Globe, group: 'Navigation' },
    { label: 'Suppressions & Rebonds (Blacklist)', tab: 'suppressions', icon: ShieldAlert, group: 'Navigation' },
    { label: 'Playground d Envoi Direct', tab: 'playground', icon: Send, group: 'Navigation' },
    { label: 'Facturation & Mobile Money', tab: 'billing', icon: CreditCard, group: 'Navigation' },
    { label: 'Paramètres & Équipe', tab: 'settings', icon: Settings, group: 'Navigation' },
    { label: 'Webhooks Sortants & Clés API', tab: 'webhooks', icon: Key, group: 'Navigation' },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-[#111827] border border-[#374151] rounded-2xl shadow-2xl overflow-hidden space-y-2">
        {/* Search Input */}
        <div className="p-4 border-b border-[#1F2937] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#9CA3AF]" />
          <input
            autoFocus
            type="text"
            placeholder="Rechercher une page, un domaine ou un email (ou Echap pour fermer)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#1F2937] text-[10px] font-mono text-[#9CA3AF] border border-[#374151]">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                type="button"
                onClick={() => {
                  onNavigate(action.tab as NavigationTab);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1F2937] text-left text-xs text-white transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#0B0F19] border border-[#1F2937] group-hover:border-[#10B981]/40">
                    <Icon className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div>
                    <span className="font-semibold">{action.label}</span>
                    <span className="block text-[10px] text-[#6B7280]">{action.group}</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#6B7280] group-hover:text-white">Aller à ↵</span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-[#6B7280]">
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#0B0F19] border-t border-[#1F2937] flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>Conseil : Utilisez ↑ et ↓ pour naviguer</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#1F2937]">⌘K</kbd> /{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[#111827] border border-[#1F2937]">Ctrl+K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
};
