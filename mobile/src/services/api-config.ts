import { Platform } from 'react-native';

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl || '').replace(/\/$/, '');
