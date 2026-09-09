import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  Search,
  LogOut,
  User,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenCommandPalette,
}) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="h-16 bg-[#0B0F19]/80 backdrop-blur-md border-b border-[#1F2937] flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20 select-none">
      {/* Title & Page Header */}
      <div>
        <h1 className="text-sm font-bold text-white flex items-center gap-2">
          {title}
        </h1>
        <p className="text-[11px] text-[#9CA3AF]">{subtitle}</p>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-[#111827] hover:bg-[#1F2937] px-3 py-1.5 rounded-lg border border-[#1F2937] hover:border-[#374151] text-xs text-[#9CA3AF] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Recherche rapide...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#0B0F19] text-[10px] font-mono border border-[#1F2937] text-[#D1D5DB]">
            ⌘K
          </kbd>
        </button>

        {/* Backend API Live Status */}
        <div className="hidden lg:flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F2937] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[#10B981] font-medium">API Live</span>
          <span className="text-[#6B7280]">|</span>
          <span className="text-[#9CA3AF]">2ms</span>
        </div>

        {/* Mailpit Quick Link */}
        <a
          href="http://localhost:8025"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-[#1F2937] hover:bg-[#374151] text-xs font-medium text-white px-3 py-1.5 rounded-lg border border-[#374151] transition-colors"
        >
          <MailpitIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>Mailpit (8025)</span>
          <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
        </a>

        {/* User Profile & Organization Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 bg-[#111827] hover:bg-[#1F2937] text-xs font-medium text-white px-3 py-1.5 rounded-lg border border-[#1F2937] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#10B981] to-[#06B6D4] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {user?.name ? user.name[0] : 'B'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-xs leading-none">{user?.name || 'Benny Nkonga'}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none truncate max-w-[120px]">
                {user?.company || 'Acme FinTech'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in-50 duration-100 z-50">
              <div className="px-3 py-2 border-b border-[#1F2937] mb-1">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                  {user?.role || 'Admin'}
                </span>
              </div>

              <a
                href="https://tuma.dev/docs"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Documentation API & SDK</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setShowUserDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se Déconnecter (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const MailpitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
