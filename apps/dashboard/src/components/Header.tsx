import React, { useState } from 'react';
import {
  ChevronDown,
  Search,
  LogOut,
  User,
  ShieldCheck,
  BookOpen,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenCommandPalette: () => void;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenCommandPalette,
  onOpenOnboarding,
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

        {/* Onboarding Walkthrough Trigger */}
        {onOpenOnboarding && (
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 bg-[#111827] hover:bg-[#1F2937] px-3 py-1.5 rounded-lg border border-[#10B981]/30 hover:border-[#10B981]/60 text-xs text-[#10B981] transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden md:inline font-medium">Guide de Démarrage</span>
            <span className="md:hidden font-medium">Guide</span>
          </button>
        )}

        {/* Backend API Live Status */}
        <div className="hidden lg:flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F2937] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[#10B981] font-medium">API Live</span>
          <span className="text-[#6B7280]">|</span>
          <span className="text-[#9CA3AF]">2ms</span>
        </div>

        {/* User Profile & Organization Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 bg-[#111827] hover:bg-[#1F2937] text-xs font-medium text-white px-3 py-1.5 rounded-lg border border-[#1F2937] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#10B981] to-[#06B6D4] flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden">
              {user?.avatarUrl && !user.avatarUrl.includes('tuma-icon.jpg') ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-xs leading-none">{user?.name || 'Utilisateur'}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5 leading-none truncate max-w-[120px]">
                {user?.company || 'Mon Organisation'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>

          {/* User Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in-50 duration-100 z-50">
              <div className="px-3 py-2 border-b border-[#1F2937] mb-1 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10B981] to-[#06B6D4] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                  {user?.avatarUrl && !user.avatarUrl.includes('tuma-icon.jpg') ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'Utilisateur'}</p>
                  <p className="text-[11px] text-[#6B7280] truncate">{user?.email || 'compte@tuma.dev'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-semibold border border-[#10B981]/30">
                      {user?.role || 'Admin'}
                    </span>
                    {user?.authProvider && user.authProvider !== 'local' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2937] text-[#9CA3AF] border border-[#374151] capitalize">
                        {user.authProvider}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenOnboarding();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#1F2937] rounded-lg transition-colors text-left"
                >
                  <Compass className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Relancer le Guide (Tour)</span>
                </button>
              )}

              <a
                href="https://tuma.eldnet.tech/docs"
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
