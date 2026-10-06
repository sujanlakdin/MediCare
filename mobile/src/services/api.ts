import { API_BASE_URL } from './api-config';

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
  isFormData?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined || options.isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined
        ? undefined
        : options.isFormData
          ? options.body as FormData
          : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError('Unable to connect. Check your connection and try again.', 0);
  }

  if (response.status === 204) return undefined as T;
  const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
  if (!response.ok) {
    const message = response.status >= 500
      ? 'The service is temporarily unavailable. Please try again.'
      : payload?.error || payload?.message || 'Your request could not be completed.';
    throw new ApiError(message, response.status);
  }
  return payload as T;
}