import * as SecureStore from 'expo-secure-store';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { ApiError, apiRequest } from '@/services/api';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role?: 'patient' | 'caregiver';
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role?: 'patient' | 'caregiver') => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (role: 'patient' | 'caregiver') => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'medicare.access-token';
const ROLE_KEY = 'medicare.user-role';

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

async function readRole() {
  if (Platform.OS === 'web') return (globalThis.localStorage?.getItem(ROLE_KEY) as 'patient' | 'caregiver' | null) ?? null;
  return (await SecureStore.getItemAsync(ROLE_KEY)) as 'patient' | 'caregiver' | null;
}

async function storeRole(role: 'patient' | 'caregiver' | null) {
  if (Platform.OS === 'web') {
    if (role) globalThis.localStorage?.setItem(ROLE_KEY, role);
    else globalThis.localStorage?.removeItem(ROLE_KEY);
    return;
  }
  if (role) await SecureStore.setItemAsync(ROLE_KEY, role);
  else await SecureStore.deleteItemAsync(ROLE_KEY);
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
        const savedRole = await readRole();
        if (!savedToken) return;
        try {
          const result = await apiRequest<{ user: AuthUser }>('/api/auth/me', { token: savedToken });
          if (active) {
            setToken(savedToken);
            const effectiveRole = savedRole || result.user.role || (result.user.email?.includes('caregiver') ? 'caregiver' : 'patient');
            setUser({ ...result.user, role: effectiveRole });
          }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await storeToken(null);
            await storeRole(null);
          } else if (active) {
            setToken(savedToken);
            // Default user fallback with savedRole
            setUser((prev) => prev ? { ...prev, role: savedRole || prev.role || 'caregiver' } : null);
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

    const email = payload.email?.toLowerCase() || '';
    const inferredRole: 'patient' | 'caregiver' =
      (payload.role as 'patient' | 'caregiver') ||
      result.user.role ||
      (email.includes('caregiver') ? 'caregiver' : 'caregiver'); // Default to caregiver for caregiver logins

    await storeRole(inferredRole);
    setUser({ ...result.user, role: inferredRole });
  }

  async function signIn(email: string, password: string) {
    await authenticate('/api/auth/login', { email, password });
  }

  async function register(fullName: string, email: string, password: string, role: 'patient' | 'caregiver' = 'caregiver') {
    await authenticate('/api/auth/register', { fullName, email, password, role });
  }

  async function signOut() {
    await storeToken(null);
    await storeRole(null);
    setToken(null);
    setUser(null);
  }

  async function switchRole(newRole: 'patient' | 'caregiver') {
    await storeRole(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : { id: 'default', fullName: 'User', email: 'user@medicare.com', role: newRole }));
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, register, signOut, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}