import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FeaturesHubPage } from './pages/FeaturesHubPage';
import { SpeedPage } from './pages/features/SpeedPage';
import { RadarPage } from './pages/features/RadarPage';
import { StudioPage } from './pages/features/StudioPage';
import { OmnichannelPage } from './pages/features/OmnichannelPage';
import { SecurityPage } from './pages/features/SecurityPage';
import { UseCasesHubPage } from './pages/UseCasesHubPage';
import { FintechPaymentsPage } from './pages/usecases/FintechPaymentsPage';
import { BankingOtpPage } from './pages/usecases/BankingOtpPage';
import { EcommerceLogisticsPage } from './pages/usecases/EcommerceLogisticsPage';
import { SaasOnboardingPage } from './pages/usecases/SaasOnboardingPage';
import { PricingPage } from './pages/PricingPage';
import { DocsPage } from './pages/DocsPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { StatusPage } from './pages/StatusPage';

export function App() {
  const getInitialPath = () => {
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    return p;
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/\/+$/, '') || '/';
      setCurrentPath(p);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const clean = path.replace(/\/+$/, '') || '/';
    window.history.pushState({ path: clean }, '', clean);
    setCurrentPath(clean);
    window.scrollTo(0, 0);
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/features':
        return <FeaturesHubPage onNavigate={navigate} />;
      case '/features/speed':
        return <SpeedPage onNavigate={navigate} />;
      case '/features/radar':
        return <RadarPage onNavigate={navigate} />;
      case '/features/studio':
        return <StudioPage onNavigate={navigate} />;
      case '/features/omnichannel':
        return <OmnichannelPage onNavigate={navigate} />;
      case '/features/security':
        return <SecurityPage onNavigate={navigate} />;
      case '/use-cases':
        return <UseCasesHubPage onNavigate={navigate} />;
      case '/use-cases/fintech-payments':
        return <FintechPaymentsPage onNavigate={navigate} />;
      case '/use-cases/banking-otp':
        return <BankingOtpPage onNavigate={navigate} />;
      case '/use-cases/ecommerce-logistics':
        return <EcommerceLogisticsPage onNavigate={navigate} />;
      case '/use-cases/saas-onboarding':
        return <SaasOnboardingPage onNavigate={navigate} />;
      case '/pricing':
      case '/tarifs':
        return <PricingPage onNavigate={navigate} />;
      case '/docs':
        return <DocsPage onNavigate={navigate} />;
      case '/contact':
        return <ContactPage onNavigate={navigate} />;
      case '/faq':
        return <FaqPage onNavigate={navigate} />;
      case '/status':
        return <StatusPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-[#F9FAFB] flex flex-col font-sans selection:bg-[#10B981]/30 selection:text-white">
      {/* Top Fixed Navbar */}
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      {/* Dynamic Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default App;
