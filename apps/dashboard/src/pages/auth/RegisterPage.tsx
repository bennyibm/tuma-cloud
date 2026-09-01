import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!name || !email || !password) {
        throw new Error('Veuillez renseigner tous les champs obligatoires.');
      }
      await register(name, email, company || 'Startup', password);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l inscription');
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
            Créer votre Compte TUMA
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Démarrez avec 10,000 emails offerts et accès immédiat à l'API
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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs shadow-glow-emerald flex items-center justify-center gap-2 transition-all mt-3"
            >
              <span>{loading ? 'Création...' : 'Créer mon Compte Développeur'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#1F2937] text-center text-xs text-[#9CA3AF]">
            Vous avez déjà un compte ?{' '}
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
