import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  company: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'pro' | 'scale' | 'enterprise';
  monthlyQuota: number;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, company: string, pass: string) => Promise<{ requiresActivation?: boolean; email: string; message?: string }>;
  activate: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, token: string, newPass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérification de session au démarrage via l'API réelle
  useEffect(() => {
    const checkAuthSession = async () => {
      const storedToken = localStorage.getItem('tuma_auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role || 'owner',
            company: data.user.company || data.organization?.name || 'TUMA Cloud',
            avatarUrl: '/tuma-icon.jpg',
          });
          if (data.organization) {
            setOrganization({
              id: data.organization.id,
              name: data.organization.name,
              slug: data.organization.slug,
              plan: data.organization.plan || 'pro',
              monthlyQuota: data.organization.monthlyQuota || 50000,
            });
          }
        } else {
          // Token expiré ou invalide
          localStorage.removeItem('tuma_auth_token');
          setUser(null);
          setOrganization(null);
        }
      } catch {
        localStorage.removeItem('tuma_auth_token');
        setUser(null);
        setOrganization(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const err: any = new Error(errorData.message || 'Adresse email ou mot de passe incorrect.');
      if (errorData.requiresActivation) {
        err.requiresActivation = true;
        err.email = errorData.email || email.trim();
      }
      throw err;
    }

    const data = await res.json();
    localStorage.setItem('tuma_auth_token', data.token);

    setUser({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role || 'owner',
      company: data.user.company || data.organization?.name || 'TUMA Cloud',
      avatarUrl: '/tuma-icon.jpg',
    });

    if (data.organization) {
      setOrganization({
        id: data.organization.id,
        name: data.organization.name,
        slug: data.organization.slug,
        plan: data.organization.plan || 'pro',
        monthlyQuota: data.organization.monthlyQuota || 50000,
      });
    }
  };

  const register = async (name: string, email: string, company: string, pass: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        password: pass,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de l'inscription.");
    }

    const data = await res.json();

    // Si le compte nécessite une activation par code OTP (flux par défaut)
    if (data.requiresActivation) {
      return {
        requiresActivation: true,
        email: data.email || email.trim(),
        message: data.message,
      };
    }

    // Si connexion directe autorisée (fallback / tests)
    if (data.token) {
      localStorage.setItem('tuma_auth_token', data.token);
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'owner',
        company: data.user.company || data.organization?.name || 'TUMA Cloud',
        avatarUrl: '/tuma-icon.jpg',
      });
    }

    if (data.organization) {
      setOrganization({
        id: data.organization.id,
        name: data.organization.name,
        slug: data.organization.slug,
        plan: data.organization.plan || 'free',
        monthlyQuota: data.organization.monthlyQuota || 1000,
      });
    }

    return {
      requiresActivation: false,
      email: data.user?.email || email.trim(),
    };
  };

  const activate = async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        otp: otp.trim(),
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Code d'activation invalide ou expiré.");
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('tuma_auth_token', data.token);
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'owner',
        company: data.user.company || data.organization?.name || 'TUMA Cloud',
        avatarUrl: '/tuma-icon.jpg',
      });
    }

    if (data.organization) {
      setOrganization({
        id: data.organization.id,
        name: data.organization.name,
        slug: data.organization.slug,
        plan: data.organization.plan || 'free',
        monthlyQuota: data.organization.monthlyQuota || 1000,
      });
    }
  };

  const resendOtp = async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Impossible de renvoyer le code d'activation.");
    }
  };

  const resetPassword = async (email: string) => {
    await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
  };

  const confirmPasswordReset = async (email: string, token: string, newPass: string) => {
    const res = await fetch(`${API_BASE}/auth/confirm-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        token: token.trim(),
        newPassword: newPass,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Échec de la réinitialisation du mot de passe.');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('tuma_auth_token', data.token);
    }

    if (data.user) {
      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'owner',
        company: data.user.company || data.organization?.name || 'TUMA Cloud',
        avatarUrl: '/tuma-icon.jpg',
      });
    }

    if (data.organization) {
      setOrganization({
        id: data.organization.id,
        name: data.organization.name,
        slug: data.organization.slug,
        plan: data.organization.plan || 'free',
        monthlyQuota: data.organization.monthlyQuota || 1000,
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('tuma_auth_token');
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        activate,
        resendOtp,
        resetPassword,
        confirmPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
