import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  RotateCw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../services/api';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current text-white" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  initialEmail?: string;
  initialStep?: 'form' | 'otp';
  initialOtp?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  initialEmail = '',
  initialStep = 'form',
  initialOtp = '',
}) => {
  const { register, activate, resendOtp } = useAuth();
  const [step, setStep] = useState<'form' | 'otp'>(initialStep);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP step state
  const [otp, setOtp] = useState(initialOtp);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Si l'utilisateur clique sur le lien magique dans son email (?email=...&otp=...)
  useEffect(() => {
    if (initialStep === 'otp' && initialEmail && initialOtp && initialOtp.length === 6) {
      const autoVerify = async () => {
        setLoading(true);
        setError(null);
        setOtpSuccess("Vérification automatique de votre compte en cours...");
        try {
          await activate(initialEmail.trim(), initialOtp.trim());
        } catch (err: any) {
          setError(err.message || "Code d'activation invalide ou expiré.");
          setOtpSuccess(null);
        } finally {
          setLoading(false);
        }
      };
      autoVerify();
    }
  }, [initialEmail, initialOtp, initialStep]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!name.trim() || !email.trim() || !password) {
        throw new Error('Veuillez renseigner tous les champs obligatoires.');
      }
      const res = await register(name, email, company || 'Startup', password);
      if (res.requiresActivation) {
        setEmail(res.email || email.trim());
        setStep('otp');
        setCooldown(60);
        setOtpSuccess(res.message || `Un code d'activation à 6 chiffres a été envoyé à ${res.email || email.trim()}.`);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
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
      await activate(email.trim(), otp.trim());
      // Une fois activé, useAuth met à jour l'utilisateur et l'app bascule sur le dashboard
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
      await resendOtp(email.trim());
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
      <div className="absolute left-10 bottom-10 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-[#111827] border border-[#1F2937] shadow-glow-emerald">
          <img src="/tuma-icon.jpg" alt="Tuma Official Logo" className="w-14 h-14 rounded-xl border border-[#10B981]/30 object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {step === 'form' ? 'Créer votre Compte TUMA' : 'Activez votre Compte'}
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {step === 'form'
              ? "Démarrez avec 1 000 emails offerts chaque mois et accès immédiat à l'API"
              : `Code de sécurité envoyé à ${email}`}
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

          {otpSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{otpSuccess}</span>
            </div>
          )}

          {step === 'form' ? (
            <div className="space-y-4">
              {/* Boutons OAuth Google & GitHub */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${API_BASE}/auth/google`;
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 bg-[#0B0F19] hover:bg-[#1F2937] border border-[#1F2937] hover:border-[#374151] rounded-xl text-xs font-semibold text-white transition-all shadow-sm group active:scale-[0.98]"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${API_BASE}/auth/github`;
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 bg-[#0B0F19] hover:bg-[#1F2937] border border-[#1F2937] hover:border-[#374151] rounded-xl text-xs font-semibold text-white transition-all shadow-sm group active:scale-[0.98]"
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Séparateur */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1F2937]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="px-2 bg-[#111827] text-[#6B7280]">ou inscription par email</span>
                </div>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Nom Complet</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dieudonné Mwamba"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Entreprise / Projet</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Kinshasa FinTech SAS"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                  Email Professionnel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dieudonne@kinshasa-fintech.cd"
                    className="w-full bg-[#0B0F19] text-xs text-white placeholder-[#6B7280] pl-9 pr-4 py-2.5 rounded-lg border border-[#1F2937] focus:outline-none focus:border-[#10B981] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Mot de Passe</label>
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
                    className="absolute right-3 top-3 text-[#6B7280] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#1F2937] rounded-xl text-[11px] text-[#9CA3AF] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Offre Gratuite : <strong>1 000 emails/mois</strong> inclus dès validation par code OTP.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all mt-3"
              >
                <span>{loading ? 'Création...' : 'Créer mon Compte Développeur'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Saisissez le code reçu par email</h3>
                <p className="text-xs text-[#9CA3AF]">
                  Un code de confirmation à 6 chiffres a été expédié à l'adresse{' '}
                  <strong className="text-white font-mono">{email}</strong>.
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
                  onClick={() => setStep('form')}
                  className="text-[#9CA3AF] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modifier l'email</span>
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

          <div className="pt-4 border-t border-[#1F2937] text-center text-xs text-[#9CA3AF]">
            Vous avez déjà un compte actif ?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-[#10B981] hover:underline"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
