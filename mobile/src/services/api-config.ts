import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const deviceApiUrl = Device.isDevice && expoHost
  ? `http://${expoHost}:5000`
  : undefined;

const defaultBaseUrl = Platform.select({
  android: deviceApiUrl || 'http://10.0.2.2:5000',
  ios: deviceApiUrl || 'http://localhost:5000',
  default: 'http://10.36.133.158:5000',
});

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl || '').replace(/\/$/, '');
