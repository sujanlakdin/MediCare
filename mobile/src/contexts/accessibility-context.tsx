import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/services/api';

export type AccessibilitySettings = {
  fontSize: 'standard' | 'large' | 'extraLarge';
  highContrast: boolean;
  largerButtons: boolean;
  largerTouchTargets: boolean;
  voiceAssistance: boolean;
  reduceMotion: boolean;
  simpleLanguage: boolean;
};

type AccessibilityContextValue = {
  settings: AccessibilitySettings;
  isLoading: boolean;
  saveSettings: (settings: AccessibilitySettings) => Promise<void>;
};

const defaults: AccessibilitySettings = {
  fontSize: 'standard',
  highContrast: false,
  largerButtons: false,
  largerTouchTargets: false,
  voiceAssistance: false,
  reduceMotion: false,
  simpleLanguage: false,
};
const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);


export function AccessibilityProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const [settings, setSettings] = useState(defaults);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const isLoading = Boolean(token && token !== loadedToken);

  useEffect(() => {
    let active = true;
    if (!token) {
      setSettings(defaults);
      setLoadedToken(null);
      return () => {
        active = false;
      };
    }
    void apiRequest<{ settings: AccessibilitySettings }>('/api/users/accessibility-settings', { token })
      .then((result) => {
        if (active) setSettings({ ...defaults, ...result.settings });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadedToken(token);
      });
    return () => {
      active = false;
    };
  }, [token]);

  async function saveSettings(next: AccessibilitySettings) {
    const result = await apiRequest<{ settings: AccessibilitySettings }>(
      '/api/users/accessibility-settings',
      { method: 'PUT', token: token ?? undefined, body: next }
    );
    setSettings({ ...defaults, ...result.settings });
  }

  return (
    <AccessibilityContext.Provider value={{ settings, isLoading, saveSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error('useAccessibility must be used inside AccessibilityProvider.');
  return value;
}