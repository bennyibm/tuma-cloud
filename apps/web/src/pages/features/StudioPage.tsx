import React from 'react';
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert, FileCode, Palette } from 'lucide-react';

export const StudioPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-24 space-y-16">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => onNavigate('/features')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux fonctionnalités</span>
        </button>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Visuel & Score Anti-Spam IA en Direct</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Des emails magnifiques, certifiés 100% sans risque de spam.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            Créez des reçus transactionnels et notifications responsives sans écrire une seule ligne de HTML complexe. Notre moteur IA vérifie votre contenu en temps réel et attribue une note de délivrabilité.
          </p>
        </div>

        {/* Spam Score AI Diagnostic Simulator */}
        <div className="glass-panel p-8 rounded-3xl border border-[#1F2937] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Analyseur Anti-Spam IA en Temps Réel</h3>
            <span className="px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] font-mono font-bold text-xs border border-[#10B981]/30">
              Score : 98 / 100 (Délivrabilité Optimale)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-white font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Règles de Conformité Validées</span>
              </div>
              <ul className="text-[#9CA3AF] space-y-1 pl-5 list-disc">
                <li>Lien de désinscription légal détecté</li>
                <li>Ratio texte / image optimal (&gt; 65% texte)</li>
                <li>Absence de mots déclencheurs agressifs</li>
                <li>Balises ALT présentes sur les logos de marque</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-white font-bold flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Rendu Responsive Multi-Clients</span>
              </div>
              <ul className="text-[#9CA3AF] space-y-1 pl-5 list-disc">
                <li>Compatible Apple Mail & iOS Dark Mode</li>
                <li>Compatible Gmail Android & Web</li>
                <li>Compatible Microsoft Outlook 2016 - 2024</li>
                <li>Support natif des polices web système</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <Palette className="w-6 h-6 text-purple-400" />
            <h4 className="font-bold text-white text-sm">Éditeur Drag & Drop</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Ajoutez en un clic vos logos, boutons d'action stylisés, séparateurs et grilles de résumé de commande.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <FileCode className="w-6 h-6 text-[#10B981]" />
            <h4 className="font-bold text-white text-sm">Variables Handlebars</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Injectez dynamiquement vos montants, devises (`{"{{amount}}"} {"{{currency}}"}`), noms de clients et liens de suivi.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#1F2937] space-y-3">
            <ShieldAlert className="w-6 h-6 text-[#FF6B00]" />
            <h4 className="font-bold text-white text-sm">Mode Plain-Text Automatique</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Génération automatique de la version texte brut multipart pour les montres connectées et terminaux bas débit.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Essayez le Studio Visuel</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Choisissez parmi plus de 12 modèles professionnels Canva Pro.</p>
          </div>
          <a
            href="http://localhost:5173/templates"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Ouvrir le Studio Visuel</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
