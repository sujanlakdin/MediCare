/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const { settings } = useAccessibility();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  const colors = Colors[theme];
  if (!settings.highContrast) return colors;
  return theme === 'dark'
    ? { ...colors, text: '#ffffff', textSecondary: '#ffffff', backgroundElement: '#000000', backgroundSelected: '#333333' }
    : { ...colors, text: '#000000', textSecondary: '#000000', backgroundElement: '#ffffff', backgroundSelected: '#e6e6e6' };
}
