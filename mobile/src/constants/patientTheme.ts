import { COLORS, FONTS, METRICS } from '../theme';

/**
 * Patient Module Design Tokens
 * Re-exports core auth tokens and supplements patient-specific color variants,
 * matching medicare-patient.html and elderly accessibility guidelines.
 */
export const PATIENT_COLORS = {
  ...COLORS,
  brand: '#006A4E',
  brandDark: '#005A42',
  deep: '#0F3D2E',
  accent: '#3AB68B',
  mint: '#E0F3EB',
  mintBorder: '#CBE8DA',
  background: '#F1F7F3',
  surface: '#FFFFFF',
  text: '#1B2B24',
  muted: '#5F7268',
  ph: '#6B7C88',
  border: '#E2E8F0',
  danger: '#C94A4A',
  dangerBg: '#FCEEEE',
  warn: '#E3A83B',
  warnBg: '#FFF8E8',
  warnBorder: '#F3DDA5',
  ringTrack: '#E4F3EC',
  ringProgress: '#3AB68B',
  addTimeBg: '#F6FBF8',
  addTimeBorder: '#9ED8C0',
};

export const PATIENT_METRICS = {
  ...METRICS,
  cardRadius: 24,
  buttonHeight: 58,
  buttonRadius: 999,
  inputHeight: 56,
  inputRadius: 18,
  minTouchTarget: 48,
  bottomNavHeight: 78,
};

export const PATIENT_FONTS = FONTS;

export default {
  colors: PATIENT_COLORS,
  metrics: PATIENT_METRICS,
  fonts: PATIENT_FONTS,
};
