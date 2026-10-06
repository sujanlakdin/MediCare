import * as SecureStore from 'expo-secure-store';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ApiError, apiRequest } from '@/services/api';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'medicare.access-token';

async function readToken() {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function storeToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const savedToken = await readToken();
        if (!savedToken) return;
        try {
          const result = await apiRequest<{ user: AuthUser }>('/api/auth/me', { token: savedToken });
          if (active) {
            setToken(savedToken);
            setUser(result.user);
          }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await storeToken(null);
          } else if (active) {
            setToken(savedToken);
          }
        }
      } catch {
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function authenticate(path: string, payload: Record<string, string>) {
    const result = await apiRequest<{ token: string; user: AuthUser }>(path, {
      method: 'POST',
      body: payload,
    });
    await storeToken(result.token);
    setToken(result.token);
    setUser(result.user);
  }

  async function signIn(email: string, password: string) {
    await authenticate('/api/auth/login', { email, password });
  }

  async function register(fullName: string, email: string, password: string) {
    await authenticate('/api/auth/register', { fullName, email, password });
  }

  async function signOut() {
    await storeToken(null);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}