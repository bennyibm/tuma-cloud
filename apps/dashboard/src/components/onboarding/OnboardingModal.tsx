import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Globe,
  Key,
  Send,
  FileCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Radio,
  ExternalLink,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { NavigationTab } from '../Sidebar';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

interface StepContent {
  step: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  targetTab?: NavigationTab;
  actionLabel?: string;
  features: {
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const steps: StepContent[] = [
    {
      step: 1,
      badge: 'Bienvenue sur TUMA Cloud',
      title: 'L Infrastructure Email Conçue pour l Afrique',
      subtitle: 'Ingestion asynchrone sub-38ms, radar FAI télécoms et cryptographie RSA 2048',
      description:
        'Bienvenue dans votre console TUMA Cloud ! Nous avons combiné une architecture asynchrone de pointe et une télémétrie dédiée aux réseaux africains pour assurer que chaque email transactionnel arrive en boîte de réception principale.',
      icon: Sparkles,
      iconColor: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      borderColor: 'border-[#10B981]/30',
      features: [
        {
          title: 'Ingestion Asynchrone (< 38ms)',
          description: 'Cluster Redis + BullMQ garantissant un code 202 sans bloquer vos serveurs applicatifs.',
          icon: Zap,
        },
        {
          title: 'Radar FAI Africains en Direct',
          description: 'Télémétrie de délivrabilité en temps réel sur Vodacom, Airtel, Orange et Starlink.',
          icon: Radio,
        },
        {
          title: 'Délivrabilité & Zéro Spam',
          description: 'Isolation stricte des flux transactionnels et signature cryptographique universelle.',
          icon: ShieldCheck,
        },
      ],
    },
    {
      step: 2,
      badge: 'Étape 1 sur 4 : Authentification DNS',
      title: 'Authentifiez votre Domaine avec DKIM & SPF',
      subtitle: 'Protégez votre marque contre le phishing et éliminez les faux positifs',
      description:
        'Pour envoyer des emails avec votre propre nom de domaine (ex: contact@votreentreprise.com) et éviter les spams de Gmail et Outlook, configurez vos enregistrements DNS cryptographiques.',
      icon: Globe,
      iconColor: 'text-[#06B6D4]',
      bgColor: 'bg-[#06B6D4]/10',
      borderColor: 'border-[#06B6D4]/30',
      targetTab: 'domains',
      actionLabel: 'Configurer mon Domaine',
      features: [
        {
          title: 'Clés DKIM RSA 2048 Dédiées',
          description: 'Signature automatique de chaque message avec le sélecteur officiel tuma1._domainkey.',
          icon: Key,
        },
        {
          title: 'Return-Path SPF & DMARC',
          description: 'Validation de l alignement du domaine pour satisfaire aux exigences Google/Yahoo 2024+.',
          icon: ShieldCheck,
        },
        {
          title: 'Vérification DNS en 1 Clic',
          description: 'Interrogation instantanée des serveurs de noms et validation automatique du statut.',
          icon: CheckCircle2,
        },
      ],
    },
    {
      step: 3,
      badge: 'Étape 2 sur 4 : Intégration Développeur',
      title: 'Générez vos Clés API & Webhooks',
      subtitle: 'Connectez n importe quel backend avec sécurité multi-niveaux',
      description:
        'Intégrez TUMA en quelques minutes dans vos applications Node.js, Python, PHP, Go ou via de simples requêtes cURL. Recevez des notifications temps réel signées cryptographiquement.',
      icon: Key,
      iconColor: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
      borderColor: 'border-[#F59E0B]/30',
      targetTab: 'webhooks',
      actionLabel: 'Générer une Clé API',
      features: [
        {
          title: 'Clés Live & Test Séparées',
          description: 'Préfixes tuma_live_ et tuma_test_ avec restriction d adresses IP autorisées.',
          icon: Key,
        },
        {
          title: 'Webhooks Signés HMAC SHA-256',
          description: 'Notifications automatiques lors des ouvertures, clics, réceptions ou bounces.',
          icon: Zap,
        },
        {
          title: 'Documentation OpenAPI Complète',
          description: 'Schémas stricts et bibliothèques client prêtes à l emploi.',
          icon: ExternalLink,
        },
      ],
    },
    {
      step: 4,
      badge: 'Étape 3 sur 4 : Test en Direct',
      title: 'Expédiez votre Premier Email dans le Playground',
      subtitle: 'Testez l envoi immédiatement sans écrire la moindre ligne de code',
      description:
        'Le Playground interactif vous permet de composer un email, d injecter des variables dynamiques, de déclencher l envoi en direct et d inspecter les logs instantanés.',
      icon: Send,
      iconColor: 'text-[#FF6B00]',
      bgColor: 'bg-[#FF6B00]/10',
      borderColor: 'border-[#FF6B00]/30',
      targetTab: 'playground',
      actionLabel: 'Ouvrir le Playground',
      features: [
        {
          title: 'Génération de Code Multi-Langages',
          description: 'Copiez instantanément le snippet équivalent en cURL, Node.js ou Python.',
          icon: Zap,
        },
        {
          title: 'Audit Trail & En-têtes SMTP',
          description: 'Visualisez le messageId et tracez l email de la file d attente jusqu au destinataire.',
          icon: Radio,
        },
        {
          title: 'Bascule SMS/WhatsApp (Failover)',
          description: 'Testez le fallback automatique en cas d email non délivré.',
          icon: ShieldCheck,
        },
      ],
    },
    {
      step: 5,
      badge: 'Étape 4 sur 4 : Modèles & Studio',
      title: 'Personnalisez vos Modèles dans le Studio Visuel',
      subtitle: 'Reçus de paiement OHADA, OTP 2FA et alertes responsives',
      description:
        'Profitez de templates professionnels prêts à l emploi avec support des variables Handlebars dynamiques ou concevez les vôtres grâce à l éditeur par glisser-déposer.',
      icon: FileCode,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      targetTab: 'templates',
      actionLabel: 'Explorer les Modèles',
      features: [
        {
          title: 'Reçus OHADA Conformes',
          description: 'Format légal certifié avec tableaux de TVA, mentions légales et QR code.',
          icon: FileCode,
        },
        {
          title: 'Codes OTP 2FA Sécurisés',
          description: 'Boutons de validation haute visibilité et délai d expiration configurable.',
          icon: Key,
        },
        {
          title: 'Variables Dynamiques Handlebars',
          description: 'Injectez {{nom}}, {{montant}}, {{date}} automatiquement via vos requêtes API.',
          icon: Sparkles,
        },
      ],
    },
  ];

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        setCurrentStepIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        setCurrentStepIndex((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, isLastStep, isFirstStep]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('tuma_onboarding_completed', 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleDismiss();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleActionClick = (tab: NavigationTab) => {
    if (dontShowAgain) {
      localStorage.setItem('tuma_onboarding_completed', 'true');
    }
    onNavigateTab(tab);
    onClose();
  };

  const CurrentIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0B0F19] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Progress Bar */}
        <div className="w-full bg-[#1F2937] h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#10B981] via-[#06B6D4] to-[#10B981] h-1.5 transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Header Section */}
        <div className="px-8 pt-6 pb-4 border-b border-[#1F2937]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${currentStep.bgColor} border ${currentStep.borderColor} flex items-center justify-center ${currentStep.iconColor} shrink-0 shadow-glow-emerald`}
            >
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                  {currentStep.badge}
                </span>
                <span className="text-xs text-[#6B7280]">
                  Étape {currentStepIndex + 1} sur {steps.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer le guide"
            className="p-1.5 text-[#9CA3AF] hover:text-white bg-[#111827] hover:bg-[#1F2937] border border-[#1F2937] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-8 py-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Main Description */}
          <div className="space-y-2">
            <p className="text-sm text-[#D1D5DB] leading-relaxed">
              {currentStep.description}
            </p>
            <p className="text-xs text-[#9CA3AF]">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Key Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {currentStep.features.map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 hover:border-[#374151] transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-[#1F2937] text-[#10B981] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <FeatIcon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-white mb-1">
                      {feat.title}
                    </h4>
                    <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Action Link if Target Tab exists */}
          {currentStep.targetTab && currentStep.actionLabel && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#10B981]/10 via-[#111827] to-[#111827] border border-[#10B981]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="text-xs text-[#E5E7EB]">
                  Vous pouvez accéder directement à cette fonctionnalité maintenant :
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleActionClick(currentStep.targetTab!)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-xs rounded-lg transition-colors shadow-glow-emerald shrink-0"
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-8 py-4 border-t border-[#1F2937] bg-[#111827]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Checkbox "Don't show again" */}
          <label className="flex items-center gap-2 text-xs text-[#9CA3AF] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-[#0B0F19] border-[#374151] text-[#10B981] focus:ring-0 focus:ring-offset-0 accent-[#10B981] cursor-pointer"
            />
            <span>Ne plus afficher automatiquement au démarrage</span>
          </label>

          {/* Step Dots & Next/Prev Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5 mr-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  aria-label={`Aller à l étape ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#10B981]'
                      : 'w-2 bg-[#374151] hover:bg-[#4B5563]'
                  }`}
                />
              ))}
            </div>

            {/* Back Button */}
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-lg border border-[#1F2937] bg-[#111827] text-xs font-medium text-[#D1D5DB] hover:bg-[#1F2937] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>
            )}

            {/* Skip / Dismiss Button */}
            {!isLastStep && (
              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors"
              >
                Passer le guide
              </button>
            )}

            {/* Next / Finish Button */}
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-glow-emerald"
            >
              <span>{isLastStep ? 'Terminer et Commencer' : 'Suivant'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
