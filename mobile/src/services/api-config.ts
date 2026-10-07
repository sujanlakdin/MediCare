import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0]
  || (Constants as any).linkingUri?.replace(/^https?:\/\//, '').split(/[:/]/)[0];

const deviceApiUrl = expoHost ? `http://${expoHost}:5000` : undefined;

const webUrl = typeof window !== 'undefined' && window.location?.hostname
  ? `http://${window.location.hostname}:5000`
  : 'http://localhost:5000';

const defaultBaseUrl = Platform.select({
  web: webUrl,
  android: deviceApiUrl || 'http://10.0.2.2:5000',
  ios: deviceApiUrl || 'http://localhost:5000',
  default: deviceApiUrl || 'http://localhost:5000',
});

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl || '').replace(/\/$/, '');
