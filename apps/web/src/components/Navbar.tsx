import React, { useState, useEffect } from 'react';
import {
  Radio,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Layers,
  Zap,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Key,
  ShoppingBag,
  Rocket,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [useCasesDropdownOpen, setUseCasesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featureLinks = [
    { path: '/features/speed', label: 'Vitesse Sub-38ms & BullMQ', icon: Zap, color: 'text-[#10B981]' },
    { path: '/features/radar', label: 'Radar FAI & Télécoms', icon: Radio, color: 'text-[#06B6D4]' },
    { path: '/features/studio', label: 'Studio Visuel & Anti-Spam IA', icon: Sparkles, color: 'text-purple-400' },
    { path: '/features/omnichannel', label: 'Bascule SMS & WhatsApp', icon: MessageSquare, color: 'text-[#FF6B00]' },
    { path: '/features/security', label: 'DKIM RSA 2048 & IP Whitelist', icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  const useCaseLinks = [
    { path: '/use-cases/fintech-payments', label: 'Reçus Mobile Money & FinTech', icon: CreditCard, color: 'text-[#10B981]' },
    { path: '/use-cases/banking-otp', label: 'Codes OTP 2FA Sub-3s & Banques', icon: Key, color: 'text-[#06B6D4]' },
    { path: '/use-cases/ecommerce-logistics', label: 'E-commerce & Facturation OHADA', icon: ShoppingBag, color: 'text-[#FF6B00]' },
    { path: '/use-cases/saas-onboarding', label: 'SaaS & Alertes DevOps', icon: Rocket, color: 'text-purple-400' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'glass-nav py-3 shadow-2xl' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo Lockup */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 group text-left"
        >
          <div className="relative">
            <img
              src="/tuma-icon.jpg"
              alt="TUMA Cloud"
              className="w-9 h-9 rounded-xl object-cover border border-[#10B981]/40 shadow-glow-emerald group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10B981] rounded-full ring-2 ring-[#0B0F19] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>TUMA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                Cloud
              </span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#9CA3AF]">
          {/* Features Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setFeaturesDropdownOpen(true)}
            onMouseLeave={() => setFeaturesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => onNavigate('/features')}
              className={`flex items-center gap-1 hover:text-white transition-colors py-1 ${
                currentPath.startsWith('/features') ? 'text-[#10B981] font-bold' : ''
              }`}
            >
              <span>Fonctionnalités</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {featuresDropdownOpen && (
              <div className="absolute top-full left-0 w-72 glass-panel rounded-2xl p-2 border border-[#1F2937] shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('/features');
                    setFeaturesDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#111827] flex items-center justify-between border-b border-[#1F2937]/50 pb-2 mb-1"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Toutes les fonctionnalités</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#10B981]" />
                </button>
                {featureLinks.map((fl) => {
                  const Icon = fl.icon;
                  return (
                    <button
                      key={fl.path}
                      type="button"
                      onClick={() => {
                        onNavigate(fl.path);
                        setFeaturesDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-[#111827] transition-colors ${
                        currentPath === fl.path ? 'bg-[#10B981]/15 text-[#10B981] font-bold' : 'text-[#D1D5DB]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${fl.color}`} />
                      <span>{fl.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Use Cases Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setUseCasesDropdownOpen(true)}
            onMouseLeave={() => setUseCasesDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => onNavigate('/use-cases')}
              className={`flex items-center gap-1 hover:text-white transition-colors py-1 ${
                currentPath.startsWith('/use-cases') ? 'text-[#10B981] font-bold' : ''
              }`}
            >
              <span>Cas d'Usage</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {useCasesDropdownOpen && (
              <div className="absolute top-full left-0 w-72 glass-panel rounded-2xl p-2 border border-[#1F2937] shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('/use-cases');
                    setUseCasesDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#111827] flex items-center justify-between border-b border-[#1F2937]/50 pb-2 mb-1"
                >
                  <span className="flex items-center gap-2">
                    <Rocket className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Tous les cas d'usage</span>
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#10B981]" />
                </button>
                {useCaseLinks.map((uc) => {
                  const Icon = uc.icon;
                  return (
                    <button
                      key={uc.path}
                      type="button"
                      onClick={() => {
                        onNavigate(uc.path);
                        setUseCasesDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 hover:bg-[#111827] transition-colors ${
                        currentPath === uc.path ? 'bg-[#10B981]/15 text-[#10B981] font-bold' : 'text-[#D1D5DB]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${uc.color}`} />
                      <span>{uc.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/pricing')}
            className={`hover:text-white transition-colors ${
              currentPath === '/pricing' || currentPath === '/tarifs' ? 'text-[#10B981] font-bold' : ''
            }`}
          >
            Tarifs (USD / CDF)
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/docs')}
            className={`hover:text-white transition-colors ${
              currentPath === '/docs' ? 'text-[#10B981] font-bold' : ''
            }`}
          >
            Documentation API
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/faq')}
            className={`hover:text-white transition-colors ${
              currentPath === '/faq' ? 'text-[#10B981] font-bold' : ''
            }`}
          >
            FAQ
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/contact')}
            className={`hover:text-white transition-colors ${
              currentPath === '/contact' ? 'text-[#10B981] font-bold' : ''
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="http://localhost:5173/login"
            className="px-4 py-2 text-xs font-semibold text-white hover:text-[#10B981] transition-colors"
          >
            Connexion
          </a>
          <a
            href="http://localhost:5173/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-xs font-bold shadow-glow-emerald flex items-center gap-1.5 transition-all group"
          >
            <span>Démarrer Gratuitement</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#9CA3AF] hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-[#1F2937] p-6 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-[#9CA3AF]">
            <button
              type="button"
              onClick={() => {
                onNavigate('/features');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-white py-1"
            >
              Hub Fonctionnalités
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/use-cases');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-white py-1"
            >
              Cas d'Usage Métiers
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/pricing');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-white py-1"
            >
              Tarifs (USD / CDF)
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/docs');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-white py-1"
            >
              Documentation API
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/faq');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-white py-1"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="text-left hover:text-white py-1"
            >
              Contact Entreprise
            </button>
          </nav>

          <div className="pt-4 border-t border-[#1F2937] flex flex-col gap-2">
            <a
              href="http://localhost:5173/login"
              className="w-full text-center py-2.5 text-xs font-semibold text-white bg-[#111827] rounded-xl border border-[#1F2937]"
            >
              Connexion au Dashboard
            </a>
            <a
              href="http://localhost:5173/register"
              className="w-full text-center py-2.5 text-xs font-bold text-white bg-[#10B981] rounded-xl shadow-glow-emerald"
            >
              Démarrer Gratuitement
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
