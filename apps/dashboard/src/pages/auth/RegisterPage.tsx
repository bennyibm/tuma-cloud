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

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  initialEmail?: string;
  initialStep?: 'form' | 'otp';
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  initialEmail = '',
  initialStep = 'form',
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
  const [otp, setOtp] = useState('');
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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
        setStep('otp');
        setCooldown(60);
        setOtpSuccess(res.message || "Un code d'activation à 6 chiffres vous a été envoyé.");
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
