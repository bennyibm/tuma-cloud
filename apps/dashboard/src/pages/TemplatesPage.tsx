import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileCode,
  Sparkles,
  Edit3,
  Send,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  CreditCard,
  Key,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { VisualTemplateStudio, TemplateData } from '../components/templates/VisualTemplateStudio';
import { api } from '../services/api';

const DEFAULT_TEMPLATES: TemplateData[] = [
  {
    id: 'tpl_1',
    name: '🛍️ Reçu de Paiement M-Pesa / Mobile Money',
    slug: 'mobile-money-receipt',
    category: 'fintech',
    subject: 'Reçu de votre transaction {{transactionId}} ({{amount}} {{currency}})',
    testVariables: {
      transactionId: 'MPESA-8923471',
      amount: '50,000',
      currency: 'CDF',
      provider: 'M-Pesa (Vodacom RDC)',
      customerName: 'Dieudonné Mwamba',
      phoneNumber: '+243 81 999 1234',
      date: '27 Août 2026 à 14:35',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: {
          logoUrl: '/tuma-icon.jpg',
          brandName: 'Kinshasa FinTech',
          badgeText: 'Paiement Confirmé ✓',
          badgeColor: '#10B981',
        },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: '{{amount}} {{currency}}',
          subtitle: 'Réf: {{transactionId}} • Opérateur: {{provider}}',
          align: 'center',
          titleColor: '#ffffff',
        },
      },
      {
        id: 'b3',
        type: 'receipt',
        content: {
          customerName: '{{customerName}}',
          phoneNumber: '{{phoneNumber}}',
          provider: 'M-Pesa (Vodacom)',
          total: '{{amount}} {{currency}}',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: {
          text: 'Télécharger le Reçu PDF',
          url: 'https://kinshasa-fintech.cd/receipts/{{transactionId}}',
          bgColor: '#10B981',
          textColor: '#ffffff',
          radius: '8px',
          align: 'center',
        },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          company: 'Kinshasa FinTech SAS • Kinshasa Gombe, RDC',
          unsubscribeUrl: 'https://kinshasa-fintech.cd/unsub',
        },
      },
    ],
  },
  {
    id: 'tpl_2',
    name: '🔐 Code OTP 6 Chiffres & Authentification 2FA',
    slug: 'security-otp',
    category: 'security',
    subject: '🔑 Votre code de vérification TUMA : {{otpCode}}',
    testVariables: {
      userName: 'Benny',
      otpCode: '849 201',
      magicLinkUrl: 'http://localhost:5173',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: {
          logoUrl: '/tuma-icon.jpg',
          brandName: 'TUMA Security',
          badgeText: 'Vérification 2FA',
          badgeColor: '#06B6D4',
        },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Code de Sécurité',
          subtitle: 'Bonjour {{userName}}, utilisez le code à 6 chiffres ci-dessous pour vous connecter :',
          align: 'center',
          titleColor: '#ffffff',
        },
      },
      {
        id: 'b3',
        type: 'otp',
        content: {
          code: '{{otpCode}}',
          expiresIn: '10 minutes',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: {
          text: 'Connexion 1-Clic via Magic Link',
          url: '{{magicLinkUrl}}',
          bgColor: '#10B981',
          textColor: '#ffffff',
          radius: '8px',
          align: 'center',
        },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          company: 'TUMA Cloud Infrastructure • Kinshasa, RDC',
          unsubscribeUrl: '#',
        },
      },
    ],
  },
  {
    id: 'tpl_3',
    name: '🚀 Bienvenue Développeur & Quickstart SDK',
    slug: 'welcome-onboarding',
    category: 'saas',
    subject: '🎉 Bienvenue sur TUMA Cloud, {{developerName}} !',
    testVariables: {
      developerName: 'Alexandre',
      projectName: 'PayGate Central Africa',
    },
    blocks: [
      {
        id: 'b1',
        type: 'header',
        content: {
          logoUrl: '/tuma-icon.jpg',
          brandName: 'TUMA Cloud',
          badgeText: 'Plan Pro Développeur',
          badgeColor: '#FF6B00',
        },
      },
      {
        id: 'b2',
        type: 'hero',
        content: {
          title: 'Bienvenue sur TUMA 🚀',
          subtitle: 'Votre infrastructure pour {{projectName}} est prête.',
          align: 'left',
          titleColor: '#ffffff',
        },
      },
      {
        id: 'b3',
        type: 'text',
        content: {
          body: 'Bonjour {{developerName}}, vous disposez de 10,000 emails offerts par mois et d une intégration en moins de 5 lignes de code.',
          align: 'left',
        },
      },
      {
        id: 'b4',
        type: 'button',
        content: {
          text: 'Accéder à la Documentation SDK',
          url: 'https://tuma.dev/docs',
          bgColor: '#FF6B00',
          textColor: '#ffffff',
          radius: '8px',
          align: 'center',
        },
      },
      {
        id: 'b5',
        type: 'footer',
        content: {
          company: 'TUMA Developer Platform • Kinshasa, RDC',
          unsubscribeUrl: '#',
        },
      },
    ],
  },
];

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TemplateData[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quickSentId, setQuickSentId] = useState<string | null>(null);

  // Si on est en mode édition / création dans le studio
  if (editingTemplate) {
    return (
      <VisualTemplateStudio
        initialData={editingTemplate}
        onBack={() => setEditingTemplate(null)}
        onSave={(saved) => {
          const index = templates.findIndex((t) => t.slug === saved.slug);
          if (index >= 0) {
            const updated = [...templates];
            updated[index] = saved;
            setTemplates(updated);
          } else {
            setTemplates([saved, ...templates]);
          }
          setEditingTemplate(null);
        }}
      />
    );
  }

  const handleCreateNew = () => {
    const blankTemplate: TemplateData = {
      name: 'Nouveau Modèle d Email',
      slug: 'nouveau-modele-' + Math.random().toString(36).substring(2, 6),
      category: 'transactional',
      subject: 'Notification importante pour {{userName}}',
      testVariables: { userName: 'Alexandre' },
      blocks: [
        {
          id: 'b1',
          type: 'header',
          content: {
            logoUrl: '/tuma-icon.jpg',
            brandName: 'Mon Entreprise',
            badgeText: 'Important',
            badgeColor: '#10B981',
          },
        },
        {
          id: 'b2',
          type: 'hero',
          content: {
            title: 'Titre de votre Notification',
            subtitle: 'Sous-titre descriptif pour votre destinataire',
            align: 'center',
          },
        },
        {
          id: 'b3',
          type: 'text',
          content: {
            body: 'Bonjour {{userName}}, voici les détails de votre message transactionnel.',
            align: 'left',
          },
        },
        {
          id: 'b4',
          type: 'button',
          content: {
            text: 'Accéder à mon Compte',
            url: 'https://tuma.dev',
            bgColor: '#10B981',
            textColor: '#ffffff',
            radius: '8px',
            align: 'center',
          },
        },
        {
          id: 'b5',
          type: 'footer',
          content: {
            company: 'Société Kinshasa • RDC',
            unsubscribeUrl: '#',
          },
        },
      ],
    };
    setEditingTemplate(blankTemplate);
  };

  const handleQuickTestSend = async (tpl: TemplateData) => {
    setQuickSentId(tpl.id || tpl.slug);
    try {
      await api.sendEmail({
        from: 'Tuma Notifications <notifications@tuma.dev>',
        to: ['developer@startup-kinshasa.cd'],
        subject: `[TEST] ${tpl.subject.replace(/{{[a-zA-Z0-9]+}}/g, 'Alexandre')}`,
        html: `<h2>Test rapide du template ${tpl.name}</h2><p>Le template est validé et prêt pour l'envoi en production.</p>`,
        tags: [{ name: 'template', value: tpl.slug }],
      });
      setTimeout(() => setQuickSentId(null), 3000);
    } catch {
      setQuickSentId(null);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Supprimer ce template définitivement ?')) return;
    try {
      await api.deleteTemplate(slug);
    } catch {
      // ignore
    }
    setTemplates(templates.filter((t) => t.slug !== slug));
  };

  const handleDuplicate = (tpl: TemplateData) => {
    const clone: TemplateData = {
      ...tpl,
      name: `${tpl.name} (Copie)`,
      slug: `${tpl.slug}-copie-${Math.random().toString(36).substring(2, 5)}`,
      id: 'tpl_' + Math.random().toString(36).substring(2, 7),
    };
    setTemplates([clone, ...templates]);
  };

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Main CTA Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>Modèles d'Emails & Templates</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              {templates.length} Actifs
            </span>
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Gérez vos modèles d'emails transactionnels, créez de nouveaux designs avec le Studio Visuel ou le code Handlebars.
          </p>
        </div>

        {/* Studio Launch Button */}
        <button
          type="button"
          onClick={handleCreateNew}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs shadow-glow-emerald flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Nouveau Template</span>
        </button>
      </div>

      {quickSentId && (
        <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] font-semibold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Email de test expédié en direct ! Inspectez-le dans Mailpit.</span>
          </span>
          <a
            href="http://localhost:8025"
            target="_blank"
            rel="noreferrer"
            className="underline flex items-center gap-1 text-white font-bold"
          >
            Ouvrir Mailpit (8025) <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Canva-Style Pro Showcase Banner */}
      <div className="bg-[#111827] rounded-2xl p-6 border border-[#1F2937] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>Démarrer avec un Modèle Professionnel (Canva Gallery)</span>
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Sélectionnez un modèle pré-conçu pour l'ouvrir immédiatement dans le Studio Visuel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setEditingTemplate(tpl)}
              className="bg-[#0B0F19] hover:bg-[#1F2937] p-4 rounded-xl border border-[#1F2937] hover:border-[#10B981]/50 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white group-hover:text-[#10B981] transition-colors truncate">
                  {tpl.name}
                </span>
                <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[11px] text-[#9CA3AF] line-clamp-2">{tpl.subject}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.keys(tpl.testVariables).slice(0, 3).map((v) => (
                  <span key={v} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111827] text-[#10B981]">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111827] rounded-xl p-4 border border-[#1F2937] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, slug ou objet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#1F2937] text-xs">
          {['all', 'fintech', 'security', 'saas'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                categoryFilter === cat ? 'bg-[#1F2937] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {cat === 'all'
                ? 'Tous'
                : cat === 'fintech'
                ? 'Paiements & Reçus'
                : cat === 'security'
                ? 'Sécurité & OTP'
                : 'SaaS & Onboarding'}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tpl) => (
          <div
            key={tpl.slug}
            className="bg-[#111827] rounded-2xl border border-[#1F2937] hover:border-[#374151] overflow-hidden flex flex-col justify-between transition-all space-y-4 p-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  {tpl.category}
                </span>
                <span className="font-mono text-[10px] text-[#6B7280]">slug: {tpl.slug}</span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white">{tpl.name}</h3>
                <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-2">{tpl.subject}</p>
              </div>

              {/* Variables Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {Object.keys(tpl.testVariables).map((v) => (
                  <span
                    key={v}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0F19] text-[#06B6D4] border border-[#1F2937]"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setEditingTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-xs font-semibold text-white border border-[#374151] flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Ouvrir Studio</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickTestSend(tpl)}
                  className="p-1.5 rounded-lg bg-[#0B0F19] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937]"
                  title="Tester l'envoi rapide"
                >
                  <Send className="w-3.5 h-3.5 text-[#FF6B00]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDuplicate(tpl)}
                  className="p-1.5 rounded-lg bg-[#0B0F19] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-white border border-[#1F2937]"
                  title="Dupliquer le template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl.slug)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
