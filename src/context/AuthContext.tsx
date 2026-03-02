import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';

interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  role?: string;
  profilePicture?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  oauthLogin: (idToken: string, provider: 'google' | 'apple', displayName?: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ac-token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      apiFetch<{ success: boolean; user: User }>('/auth/me', { token })
        .then((data) => setUser(data.user))
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('ac-token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token, user]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ success: boolean; accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('ac-token', data.accessToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const oauthLogin = useCallback(async (idToken: string, provider: 'google' | 'apple', displayName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ success: boolean; accessToken: string; user: User }>('/auth/oauth', {
        method: 'POST',
        body: { idToken, provider, displayName },
      });
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('ac-token', data.accessToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'OAuth login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ac-token');
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!token) throw new Error('Not authenticated');
    setLoading(true);
    try {
      await apiFetch('/auth/account', { method: 'DELETE', token });
      logout();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, oauthLogin, logout, deleteAccount, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
