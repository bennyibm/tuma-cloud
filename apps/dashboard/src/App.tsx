import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { Overview } from './pages/Overview';
import { EmailsLogs } from './pages/EmailsLogs';
import { DomainsPage } from './pages/DomainsPage';
import { WebhooksPage } from './pages/WebhooksPage';
import { SuppressionsPage } from './pages/SuppressionsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { BillingPage } from './pages/BillingPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

type AuthView = 'login' | 'register' | 'reset';

const VALID_TABS: NavigationTab[] = [
  'overview',
  'emails',
  'templates',
  'domains',
  'suppressions',
  'playground',
  'billing',
  'settings',
  'webhooks',
];

const getInitialTab = (): NavigationTab => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() as NavigationTab;
  if (VALID_TABS.includes(path)) {
    return path;
  }
  const saved = localStorage.getItem('tuma_active_tab') as NavigationTab;
  if (VALID_TABS.includes(saved)) {
    return saved;
  }
  return 'overview';
};

function DashboardApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentTab, setCurrentTab] = useState<NavigationTab>(getInitialTab);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [emailCount, setEmailCount] = useState(5);

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    localStorage.setItem('tuma_active_tab', tab);
    const targetPath = tab === 'overview' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  // Sync avec les boutons Précédent / Suivant du navigateur via HTML5 History (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() as NavigationTab;
      const tabToSet = VALID_TABS.includes(path) ? path : 'overview';
      if (tabToSet !== currentTab) {
        setCurrentTab(tabToSet);
        localStorage.setItem('tuma_active_tab', tabToSet);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentTab]);

  // Synchronisation de l'URL propre au premier chargement
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() as NavigationTab;
    if (VALID_TABS.includes(path)) {
      if (currentTab !== path) {
        setCurrentTab(path);
        localStorage.setItem('tuma_active_tab', path);
      }
    } else {
      const targetPath = currentTab === 'overview' ? '/' : `/${currentTab}`;
      window.history.replaceState({ tab: currentTab }, '', targetPath);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const updateCount = async () => {
      const list = await api.getEmails();
      if (list && list.length > 0) {
        setEmailCount(list.length);
      }
    };
    updateCount();
    const interval = setInterval(updateCount, 10000);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isAuthenticated]);

  // Écran de chargement ultra-fluide pour éviter tout saut de page lors du refresh
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <img
            src="/tuma-icon.jpg"
            alt="TUMA"
            className="w-14 h-14 rounded-2xl shadow-glow-emerald border border-[#10B981]/40 object-cover animate-pulse"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span>Chargement de session TUMA...</span>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher le flux d'authentification
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'reset') {
      return <ResetPasswordPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginPage
        onSwitchToRegister={() => setAuthView('register')}
        onSwitchToReset={() => setAuthView('reset')}
      />
    );
  }

  const getPageInfo = () => {
    switch (currentTab) {
      case 'overview':
        return {
          title: "Vue d'Ensemble & Télémétrie",
          subtitle: 'Tableau de bord de délivrabilité en direct & métriques d engagement',
        };
      case 'emails':
        return {
          title: 'Logs d Emails & Audit Trail',
          subtitle: 'Flux en temps réel de tous les emails transactionnels expédiés',
        };
      case 'domains':
        return {
          title: 'Domaines & Cryptographie DNS',
          subtitle: 'Gestion des clés DKIM RSA 2048, SPF Return-Path et DMARC',
        };
      case 'webhooks':
        return {
          title: 'Webhooks Sortants & Clés API',
          subtitle: 'Configuration des endpoints de notification et clés secrètes',
        };
      case 'suppressions':
        return {
          title: 'Liste de Suppression & Bounces',
          subtitle: 'Bouclier de délivrabilité O(1) contre les hard bounces et plaintes spam',
        };
      case 'templates':
        return {
          title: 'Modèles d Emails & Templates',
          subtitle: 'Gérez vos modèles d emails, reçus et alertes ou concevez-en de nouveaux dans le Studio',
        };
      case 'billing':
        return {
          title: 'Facturation & Mobile Money',
          subtitle: 'Recharge instantanée par M-Pesa, Orange Money et Airtel Money (CDF / USD)',
        };
      case 'playground':
        return {
          title: 'Playground d Envoi Interactif',
          subtitle: 'Console de test direct avec injection de variables et rendu temps réel',
        };
      case 'settings':
        return {
          title: 'Paramètres & Équipe (RBAC)',
          subtitle: 'Configuration de l organisation, membres et seuils d alerte de quotas',
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F9FAFB] flex">
      {/* Zero-flicker Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        emailCount={emailCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 mt-16 p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && <Overview onNavigate={(t) => handleSelectTab(t as NavigationTab)} />}
          {currentTab === 'emails' && <EmailsLogs />}
          {currentTab === 'domains' && <DomainsPage />}
          {currentTab === 'webhooks' && <WebhooksPage />}
          {currentTab === 'suppressions' && <SuppressionsPage />}
          {currentTab === 'templates' && <TemplatesPage />}
          {currentTab === 'billing' && <BillingPage />}
          {currentTab === 'playground' && <PlaygroundPage />}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => handleSelectTab(tab)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}

export default App;
