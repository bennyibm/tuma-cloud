import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ENV } from '../config/env';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#05070B] border-t border-[#1F2937] pt-16 pb-12 text-xs text-[#9CA3AF]">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 text-left group"
            >
              <img src="/tuma-icon.jpg" alt="TUMA" className="w-8 h-8 rounded-xl object-cover border border-[#10B981]/40" />
              <span className="text-lg font-black text-white">TUMA Cloud</span>
            </button>
            <p className="text-xs text-[#9CA3AF] max-w-sm leading-relaxed">
              L'infrastructure email transactionnelle nouvelle génération pour l'Afrique et le Monde. Vitesse sub-38ms, conformité DKIM RSA 2048 et connectivité télécoms locale.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Systèmes 100% Opérationnels • Kinshasa & Global</span>
            </div>
          </div>

          {/* Links 1: Fonctionnalités */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Fonctionnalités</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => onNavigate('/features/speed')} className="hover:text-white transition-colors">
                  Vitesse & Ingestion &lt; 38ms
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/features/radar')} className="hover:text-white transition-colors">
                  Radar Télécoms FAI
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/features/studio')} className="hover:text-white transition-colors">
                  Studio & Score Anti-Spam
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/features/omnichannel')} className="hover:text-white transition-colors">
                  Bascule WhatsApp & SMS
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/features/security')} className="hover:text-white transition-colors">
                  Sécurité & IP Whitelist
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2: Cas d'Usage */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Cas d'Usage</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => onNavigate('/use-cases/fintech-payments')} className="hover:text-white transition-colors">
                  Reçus Mobile Money
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/use-cases/banking-otp')} className="hover:text-white transition-colors">
                  Codes OTP 2FA Sub-3s
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/use-cases/ecommerce-logistics')} className="hover:text-white transition-colors">
                  E-commerce & Livraison
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/use-cases/saas-onboarding')} className="hover:text-white transition-colors">
                  SaaS & Alertes DevOps
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/use-cases')} className="hover:text-[#10B981] font-semibold transition-colors">
                  Tous les Cas d'Usage →
                </button>
              </li>
            </ul>
          </div>

          {/* Links 3: Développeurs & Docs */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Ressources</h4>
            <ul className="space-y-2">
              <li>
                <button type="button" onClick={() => onNavigate('/docs')} className="hover:text-white transition-colors">
                  Documentation API
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/pricing')} className="hover:text-white transition-colors">
                  Tarifs & Mobile Money
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                  Foire Aux Questions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact Entreprise
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('/status')} className="hover:text-white transition-colors flex items-center gap-1.5 text-[#10B981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Statut Réseau (99.99%)</span>
                </button>
              </li>
              <li>
                <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  Mailpit Inbox <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Links 4: Console & Légal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Plateforme</h4>
            <ul className="space-y-2">
              <li><a href={`${ENV.DASHBOARD_URL}/login`} className="hover:text-white transition-colors">Connexion Console</a></li>
              <li><a href={`${ENV.DASHBOARD_URL}/register`} className="hover:text-white transition-colors">Créer un Compte Pro</a></li>
              <li><a href={`${ENV.DASHBOARD_URL}/playground`} className="hover:text-white transition-colors">Playground d Envoi</a></li>
              <li><span className="text-[#6B7280]">Conformité OHADA & BCC</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6B7280]">
          <div>
            © {new Date().getFullYear()} TUMA Cloud Inc. Tous droits réservés. Développé pour l'infrastructure FinTech.
          </div>
          <div className="flex items-center gap-4">
            <a href={`${ENV.DASHBOARD_URL}/login`} className="hover:text-white">Connexion</a>
            <a href={`${ENV.DASHBOARD_URL}/register`} className="hover:text-white">Créer un Compte</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
