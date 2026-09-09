import React from 'react';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Truck,
  FileText,
  MapPin,
  Clock,
  Package,
} from 'lucide-react';
import { ENV } from '../../config/env';

export const EcommerceLogisticsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-xs font-bold shadow-glow-solar">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cas d'Usage E-commerce & Logistique Africaine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Suivi de Livraison en Temps Réel & Facturation OHADA Conforme.
          </h1>

          <p className="text-base text-[#9CA3AF] leading-relaxed">
            De Kinshasa à Lubumbashi, de Nairobi à Abidjan, rassurez vos acheteurs avec des notifications précises de préparation de colis, de départ du coursier et des factures en pièce jointe automatique.
          </p>
        </div>

        {/* 4 Steps Order Lifecycle */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#1F2937] space-y-6">
          <h3 className="text-lg font-bold text-white">Le Parcours Client Idéal avec TUMA Cloud</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-[#10B981] font-bold flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span>1. Commande</span>
              </div>
              <p className="text-[#9CA3AF]">
                Confirmation immédiate du paiement Mobile Money et récapitulatif du panier d'achat.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-[#06B6D4] font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>2. Facture OHADA</span>
              </div>
              <p className="text-[#9CA3AF]">
                Génération automatique du PDF fiscal avec TVA conforme aux règles locales.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-[#FF6B00] font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                <span>3. Expédition</span>
              </div>
              <p className="text-[#9CA3AF]">
                Alerte de départ du coursier avec numéro du livreur et créneau horaire estimé.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#05070B] border border-[#1F2937] space-y-2">
              <div className="text-purple-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>4. Livraison</span>
              </div>
              <p className="text-[#9CA3AF]">
                Reçu final de remise en main propre et demande d'avis client en un clic.
              </p>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="bg-[#0B0F19] rounded-2xl border border-[#1F2937] p-6 space-y-3 font-mono text-xs shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2937] text-white font-bold">
            <span>Envoi d'Avis d'Expédition avec Facture PDF</span>
            <span className="text-[#FF6B00]">TypeScript SDK</span>
          </div>
          <pre className="text-[#34D399] leading-relaxed overflow-x-auto">
            <code>{`await tuma.emails.send({
  from: 'Boutique Express <orders@boutique.cd>',
  to: ['acheteur@kinshasa.cd'],
  subject: 'Votre commande #ORD-9402 est en cours de livraison 🚚',
  template: 'shipping-notification-v1',
  variables: {
    customerName: 'Dieudonné Kasongo',
    orderNumber: 'ORD-9402',
    deliveryAddress: 'Avenue de la Justice, Kinshasa Gombe',
    courierName: 'Patrick (Moto Express)',
    courierPhone: '+243820001234',
    estimatedTime: 'Aujourd\\'hui entre 15h et 17h'
  }
});`}</code>
          </pre>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#111827] to-[#0B0F19] border border-[#FF6B00]/40 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-solar">
          <div>
            <h3 className="text-xl font-bold text-white">Augmentez la satisfaction de vos clients</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Créez votre compte en 30 secondes et intégrez nos modèles e-commerce.</p>
          </div>
          <a
            href={`${ENV.DASHBOARD_URL}/register`}
            className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <span>Démarrer Gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
