import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { auth as authApi, setToken, getToken } from '../services/api';

console.log('[AUTH] AuthContext.tsx loaded');

interface User {
  _id: string;
  name: string;
  email: string;
  preferredTheme?: string;
  preferredWeightUnit?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  updateUser: (updates: Record<string, string>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('[AUTH] AuthProvider() rendering');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    console.log('[AUTH] loadUser() started');
    try {
      const token = await getToken();
      console.log('[AUTH] Token from storage:', token ? 'found' : 'null');
      if (token) {
        console.log('[AUTH] Fetching /me with token');
        const data = await authApi.getMe();
        console.log('[AUTH] /me response received:', data.user?.name);
        setUser(data.user);
      } else {
        console.log('[AUTH] No token, user stays null');
      }
    } catch (err) {
      console.log('[AUTH] loadUser error:', err);
      await setToken(null);
    } finally {
      console.log('[AUTH] loadUser finished, setting loading=false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[AUTH] useEffect - calling loadUser');
    loadUser();
  }, [loadUser]);

  const signin = async (email: string, password: string) => {
    console.log('[AUTH] signin() called');
    const data = await authApi.signin(email, password);
    console.log('[AUTH] signin success, setting token');
    await setToken(data.token);
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    console.log('[AUTH] signup() called');
    const data = await authApi.signup(name, email, password);
    console.log('[AUTH] signup success, setting token');
    await setToken(data.token);
    setUser(data.user);
  };

  const signout = async () => {
    console.log('[AUTH] signout() called');
    await setToken(null);
    setUser(null);
  };

  const updateUser = async (updates: Record<string, string>) => {
    console.log('[AUTH] updateUser() called');
    const data = await authApi.updateMe(updates);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
