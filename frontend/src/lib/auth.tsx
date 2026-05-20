'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  cafeName?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { fullName: string; cafeName?: string; email: string; password: string ; agreedToTerms : boolean }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const DEMO_USER: User = {
  id: 'demo-owner',
  email: 'demo@menumind.ai',
  fullName: 'MenuMind Demo Owner',
  cafeName: 'MenuMind Cafe',
  role: 'owner',
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.setItem('auth_token', 'demo-token');
        localStorage.setItem('auth_user', JSON.stringify(DEMO_USER));
        setToken('demo-token');
        setUser(DEMO_USER);
      }
    } else {
      localStorage.setItem('auth_token', 'demo-token');
      localStorage.setItem('auth_user', JSON.stringify(DEMO_USER));
      setToken('demo-token');
      setUser(DEMO_USER);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { api } = await import('@/lib/api');
    const response = await api.auth.login({ email, password });
    
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    
    setToken(response.token);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (data: { fullName: string; cafeName?: string; email: string; password: string; agreedToTerms: boolean }) => {
    const { api } = await import('@/lib/api');
    const response = await api.auth.signup(data);
    
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.setItem('auth_token', 'demo-token');
    localStorage.setItem('auth_user', JSON.stringify(DEMO_USER));
    setToken('demo-token');
    setUser(DEMO_USER);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
