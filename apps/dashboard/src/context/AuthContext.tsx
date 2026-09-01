import React, { createContext, useContext, useState, useEffect } from 'react';

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
  register: (name: string, email: string, company: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
        const res = await fetch('http://localhost:3001/v1/auth/me', {
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
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Adresse email ou mot de passe incorrect.');
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, company: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/v1/auth/register', {
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
          plan: data.organization.plan || 'starter',
          monthlyQuota: data.organization.monthlyQuota || 10000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await fetch('http://localhost:3001/v1/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
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
        resetPassword,
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
