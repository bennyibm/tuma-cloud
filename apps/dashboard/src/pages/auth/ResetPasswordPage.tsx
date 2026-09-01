import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordPageProps {
  onSwitchToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSwitchToLogin }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('benny@tuma.dev');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-glow-emerald">
          <img src="/tuma-icon.jpg" alt="Tuma Official Logo" className="w-14 h-14 rounded-xl border border-[#10B981]/30 object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Réinitialisation de Mot de Passe
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Recevez un lien sécurisé pour récupérer l'accès à votre compte TUMA
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#111827]/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-[#1F2937] rounded-2xl shadow-2xl space-y-6">
          {isSubmitted ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Lien de Sécurité Expédié !</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Un email contenant les instructions de réinitialisation a été envoyé à{' '}
                <strong className="text-white">{email}</strong>.
              </p>
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#1F2937] text-xs text-[#9CA3AF]">
                💡 Astuce Locale : Consultez votre boîte de test sur{' '}
                <a
                  href="http://localhost:8025"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#10B981] underline font-semibold"
                >
                  Mailpit (8025)
                </a>
              </div>

              <button
                type="button"
                onClick={onSwitchToLogin}
                className="w-full py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la connexion</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                  Adresse Email Associée au Compte
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@startup.cd"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Send className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Envoi en cours...' : 'Envoyer le Lien de Réinitialisation'}</span>
              </button>

              <button
                type="button"
                onClick={onSwitchToLogin}
                className="w-full py-2 text-xs font-medium text-[#9CA3AF] hover:text-white flex items-center justify-center gap-1.5 transition-colors pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la connexion</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
