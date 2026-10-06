import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#154D38', // Deep Forest Green
    primaryHover: '#0F3B2A',
    primaryLight: '#E6F4EE',
    accent: '#10B981', // Vibrant Emerald
    accentLight: '#D1FAE5',

    background: '#F3FAF7', // Soft Mint Page Background
    cardBackground: '#FFFFFF',
    backgroundElement: '#E8F2EC',
    backgroundSelected: '#D2E6DB',

    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textDarkGreen: '#154D38',

    border: '#E2E8F0',
    borderLight: '#EDF2F0',

    success: '#10B981',
    successBg: '#D1FAE5',

    alert: '#EF4444',
    alertHover: '#DC2626',
    alertBg: '#FEF2F2',
    alertBorder: '#FCA5A5',

    warning: '#F59E0B',
    warningBg: '#FEF3C7',

    tabInactive: '#94A3B8',
    tabActive: '#154D38',
  },
  dark: {
    primary: '#10B981',
    primaryHover: '#059669',
    primaryLight: '#132E25',
    accent: '#34D399',
    accentLight: '#064E3B',

    background: '#0F172A',
    cardBackground: '#1E293B',
    backgroundElement: '#334155',
    backgroundSelected: '#475569',

    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textDarkGreen: '#34D399',

    border: '#334155',
    borderLight: '#1E293B',

    success: '#34D399',
    successBg: '#064E3B',

    alert: '#F87171',
    alertHover: '#EF4444',
    alertBg: '#450A0A',
    alertBorder: '#7F1D1D',

    warning: '#FBBF24',
    warningBg: '#451A03',

    tabInactive: '#64748B',
    tabActive: '#34D399',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    serif: 'Georgia, serif',
    rounded: 'system-ui, sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
} as const;

export const BottomTabInset = Platform.select({ ios: 65, android: 75 }) ?? 70;
export const MaxContentWidth = 600;
