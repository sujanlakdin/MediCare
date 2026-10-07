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

function uploadWithXHR<T>(url: string, method: string, token: string | undefined, formData: FormData): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(payload as T);
        } else {
          const message = payload?.error || payload?.message || 'Your request could not be completed.';
          reject(new ApiError(message, xhr.status));
        }
      } catch {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(undefined as T);
        } else {
          reject(new ApiError('Your request could not be completed.', xhr.status));
        }
      }
    };
    xhr.onerror = () => {
      reject(new ApiError('Unable to connect. Check your connection and try again.', 0));
    };
    xhr.ontimeout = () => {
      reject(new ApiError('Unable to connect. Check your connection and try again.', 0));
    };
    xhr.send(formData);
  });
}

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
  } catch (err) {
    if (options.isFormData && options.body) {
      try {
        return await uploadWithXHR<T>(`${API_BASE_URL}${path}`, options.method ?? 'POST', options.token, options.body as FormData);
      } catch (xhrErr) {
        if (xhrErr instanceof ApiError) throw xhrErr;
      }
    }
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