import React, { useState, useEffect } from 'react';
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordPageProps {
  onSwitchToLogin: () => void;
  initialEmail?: string;
  initialToken?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onSwitchToLogin,
  initialEmail = '',
  initialToken = '',
}) => {
  const { resetPassword, confirmPasswordReset } = useAuth();

  // Mode: si un jeton est présent (soit par prop, soit dans l'URL ?token=...)
  const [token, setToken] = useState(initialToken);
  const [email, setEmail] = useState(initialEmail);
  const isSetPasswordMode = !!token;

  // État formulaire demande
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État formulaire nouveau mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token') || searchParams.get('resetToken') || '';
      const urlEmail = searchParams.get('email') || '';
      if (urlToken) setToken(urlToken);
      if (urlEmail) setEmail(urlEmail);
    }
  }, [token, email]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Impossible d envoyer le lien de réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(email.trim(), token.trim(), newPassword);
      setIsResetComplete(true);
      // useAuth met automatiquement à jour l'utilisateur et ouvre le dashboard
    } catch (err: any) {
      setError(err.message || 'Jeton de réinitialisation invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-10 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-glow-emerald">
          <img src="/tuma-icon.jpg" alt="Tuma Official Logo" className="w-14 h-14 rounded-xl border border-[#10B981]/30 object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isSetPasswordMode ? 'Nouveau Mot de Passe' : 'Réinitialisation de Mot de Passe'}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {isSetPasswordMode
              ? `Définissez un nouveau mot de passe sécurisé pour ${email}`
              : "Recevez un lien sécurisé pour récupérer l'accès à votre compte TUMA"}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#111827]/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-[#1F2937] rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {isResetComplete ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Mot de passe mis à jour !</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Votre mot de passe a été modifié avec succès. Vous êtes désormais connecté à votre espace TUMA.
              </p>
            </div>
          ) : isSetPasswordMode ? (
            /* Mode 2 : Saisie du nouveau mot de passe via le lien reçu par email */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 bg-[#0B0F19] border border-[#1F2937] rounded-xl text-xs text-[#9CA3AF] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="truncate">Compte : <strong className="text-white">{email}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                  Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-10 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#6B7280] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                  Confirmer le Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all mt-2"
              >
                <ShieldCheck className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Mise à jour en cours...' : 'Enregistrer mon nouveau mot de passe'}</span>
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
          ) : isSubmitted ? (
            /* Mode 1 - Succès demande */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Lien de Sécurité Expédié !</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Un email contenant le lien sécurisé de réinitialisation a été envoyé à{' '}
                <strong className="text-white">{email}</strong>.
              </p>
              <div className="p-3 bg-[#0B0F19] rounded-xl border border-[#1F2937] text-xs text-[#9CA3AF]">
                Cliquez sur le bouton présent dans le mail pour définir directement votre nouveau mot de passe.
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
            /* Mode 1 - Formulaire demande d'envoi */
            <form onSubmit={handleRequestSubmit} className="space-y-4">
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
                    placeholder="nom@entreprise.cd"
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
