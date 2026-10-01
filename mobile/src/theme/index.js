import { Platform } from 'react-native';

export const COLORS = {
  brand: '#006A4E', // login/signup header, primary buttons
  brandDark: '#005A42',
  deep: '#0F3D2E', // headings
  accent: '#3AB68B', // success
  mint: '#E0F3EB', // info boxes, chips
  background: '#F1F7F3',
  surface: '#FFFFFF',
  text: '#1B2B24',
  muted: '#5F7268',
  placeholder: '#94A3B8',
  border: '#E2E8F0',
  danger: '#C94A4A',
  dangerBg: '#FCEEEE',
  white: '#FFFFFF',
  shadow: 'rgba(0, 106, 78, 0.28)',
  shadowDark: 'rgba(15, 61, 46, 0.25)',
};

export const FONTS = {
  family: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'System',
  }),
  sizes: {
    xs: 12,
    sm: 13.5,
    body: 16,
    md: 17,
    lg: 18,
    xl: 22,
    xxl: 26,
    title: 30,
    hero: 40,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

export const METRICS = {
  inputHeight: 58,
  inputRadius: 20,
  buttonHeight: 58,
  buttonRadius: 999, // Pill shape
  minTouchTarget: 48,
  borderWidth: 1.5,
};

export default {
  colors: COLORS,
  fonts: FONTS,
  metrics: METRICS,
};
