import React from 'react';
import {
  Rocket,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  Layers,
  Users,
} from 'lucide-react';

export const SaasOnboardingPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => onNavigate('/use-cases')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux cas d'usage</span>
        </button>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
            <Rocket className="w-3.5 h-3.5" />
            <span>Cas d'Usage SaaS, Applications Cloud & Startups</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Activation Produit & Alertes Système Haute Vélocité.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Transformez vos inscrits en clients fidèles avec des emails de bienvenue personnalisés, des rapports d'activité hebdomadaires et des alertes de sécurité pour vos équipes d'ingénierie.
          </p>
        </div>

        {/* 3 Pillars for SaaS Growth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Users className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-base">Onboarding & Activation</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Délivrez des invitations d'équipe, des guides de prise en main et des rappels d'activation qui atterrissent systématiquement dans la boîte principale.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Activity className="w-6 h-6 text-[#10B981]" />
            <h3 className="font-bold text-white text-base">Rapports Hebdomadaires</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Compilez des tableaux de bord analytiques complexes avec le moteur Handlebars et le CSS inliner ultra-rapide de TUMA.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Terminal className="w-6 h-6 text-[#06B6D4]" />
            <h3 className="font-bold text-white text-base">Alertes DevOps & Logs</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Intégrez TUMA dans vos pipelines CI/CD et vos clusters Kubernetes pour notifier vos astreintes en cas de panne de production.
            </p>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="bg-[#0B0F19] rounded-2xl border border-[#1F2937] p-6 space-y-3 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2937] text-white font-bold">
            <span>Envoi d'Invitation d'Équipe Workspace</span>
            <span className="text-purple-400">Node.js SDK</span>
          </div>
          <pre className="text-[#34D399] leading-relaxed overflow-x-auto">
            <code>{`await tuma.emails.send({
  from: 'Cloud SaaS <team@saas.cd>',
  to: ['nouveau-developpeur@startup.cd'],
  subject: 'Alexandre vous a invité à rejoindre le cluster Production',
  template: 'team-invite-v1',
  variables: {
    inviterName: 'Alexandre Mwamba',
    workspaceName: 'Kinshasa Data Cluster',
    role: 'Administrateur Infrastructure',
    inviteUrl: 'https://app.saas.cd/invite/accept?token=9c7acdc0'
  }
});`}</code>
          </pre>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Accélérez la croissance de votre SaaS</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">3 000 emails gratuits chaque mois pour les développeurs.</p>
          </div>
          <a
            href="http://localhost:5173/register"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Créer mon Compte Gratuit</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
