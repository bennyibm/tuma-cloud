import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToRegister,
  onSwitchToReset,
}) => {
  const { login, activate, resendOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unactivated account OTP handling
  const [needsActivation, setNeedsActivation] = useState(false);
  const [activationEmail, setActivationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email.trim() || !password) {
        throw new Error('Veuillez renseigner votre email et votre mot de passe.');
      }
      await login(email.trim(), password);
    } catch (err: any) {
      if (err.requiresActivation) {
        setNeedsActivation(true);
        setActivationEmail(err.email || email.trim());
        setOtpSuccess("Un code d'activation OTP a été envoyé à votre adresse email.");
        setCooldown(60);
      } else {
        setError(err.message || 'Échec de connexion : identifiants invalides.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOtpSuccess(null);

    try {
      if (!otp.trim() || otp.trim().length !== 6) {
        throw new Error("Veuillez saisir le code à 6 chiffres reçu dans l'email.");
      }
      await activate(activationEmail.trim(), otp.trim());
    } catch (err: any) {
      setError(err.message || "Code d'activation invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      await resendOtp(activationEmail.trim());
      setCooldown(60);
      setOtpSuccess("Nouveau code d'activation envoyé avec succès !");
    } catch (err: any) {
      setError(err.message || "Impossible de renvoyer le code. Réessayez dans un instant.");
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
            {needsActivation ? 'Activation de votre Compte' : 'Connexion à votre Espace TUMA'}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {needsActivation
              ? `Veuillez saisir le code OTP envoyé à ${activationEmail}`
              : "Plateforme Cloud d'Email Transactionnel pour Développeurs"}
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#111827]/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-[#1F2937] rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          {otpSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{otpSuccess}</span>
            </div>
          )}

          {!needsActivation ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                  Adresse Email Professionnelle
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#9CA3AF]">
                    Mot de Passe
                  </label>
                  <button
                    type="button"
                    onClick={onSwitchToReset}
                    className="text-[11px] text-[#10B981] hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-10 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                    required
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#0B0F19] border-[#1F2937] text-[#10B981] focus:ring-0 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-[#9CA3AF]">Se souvenir de cet appareil</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <span>Vérification des identifiants...</span>
                ) : (
                  <>
                    <span>Se Connecter à la Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Validation du Compte Requise</h3>
                <p className="text-xs text-[#9CA3AF]">
                  Votre compte n'est pas encore activé. Saisissez le code à 6 chiffres reçu à{' '}
                  <strong className="text-white font-mono">{activationEmail}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-center text-xs font-semibold text-[#9CA3AF] mb-2">
                  Code d'activation OTP (6 chiffres)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    placeholder="123456"
                    className="w-full bg-[#0B0F19] text-center font-mono text-2xl tracking-[0.4em] font-bold text-[#10B981] placeholder-[#374151] py-3 rounded-xl border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-all shadow-inner"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-center text-[11px] text-[#6B7280] mt-1.5">
                  Ce code expire dans 15 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] disabled:opacity-50 text-white font-bold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <span>Activation en cours...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activer & Ouvrir la Console</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-[#1F2937] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setNeedsActivation(false);
                    setError(null);
                    setOtpSuccess(null);
                  }}
                  className="text-[#9CA3AF] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retour à la connexion</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || loading}
                  className={`flex items-center gap-1.5 ${
                    cooldown > 0
                      ? 'text-[#6B7280] cursor-not-allowed'
                      : 'text-[#10B981] hover:underline font-semibold'
                  }`}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer le code'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-[#1F2937] text-center">
            <p className="text-xs text-[#9CA3AF]">
              Pas encore de compte d'organisation ?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#10B981] font-bold hover:underline"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
