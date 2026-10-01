import { Platform } from 'react-native';

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://localhost:5000',
});
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl || '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  token?: string;
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('Unable to connect. Check your connection and try again.', 0);
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    const message = response.status >= 500
      ? 'The service is temporarily unavailable. Please try again.'
      : payload?.error || 'Your request could not be completed.';
    throw new ApiError(message, response.status);
  }
  return payload as T;
}