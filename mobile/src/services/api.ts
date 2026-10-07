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

export interface MedicationItem {
  _id?: string;
  id?: string;
  name: string;
  dosage: string;
  frequency?: string;
  scheduledTime: string;
  instructions?: string;
  purpose?: string;
  form?: string;
  meal?: string;
  stock?: number;
  status?: 'taken' | 'missed' | 'upcoming';
  adherencePercent?: number;
}

export interface PatientItem {
  _id: string;
  name: string;
  age: number;
  role: string;
  statusBadgeText: string;
  phone: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    bloodSugar: number;
  };
}

export const DEFAULT_PATIENTS: PatientItem[] = [
  {
    _id: '650000000000000000000001',
    name: 'Eleanor Johnson',
    age: 68,
    role: 'Patient',
    statusBadgeText: 'MONITORING ACTIVE',
    phone: '+1 (555) 019-2831',
    vitals: {
      bloodPressure: '128/82',
      heartRate: 72,
      bloodSugar: 145,
    },
  },
  {
    _id: '650000000000000000000002',
    name: 'Robert Chen',
    age: 74,
    role: 'Patient',
    statusBadgeText: 'MONITORING ACTIVE',
    phone: '+1 (555) 019-4412',
    vitals: {
      bloodPressure: '135/88',
      heartRate: 78,
      bloodSugar: 110,
    },
  },
  {
    _id: '650000000000000000000003',
    name: 'Maria Garcia',
    age: 62,
    role: 'Patient',
    statusBadgeText: 'ATTENTION NEEDED',
    phone: '+1 (555) 019-8890',
    vitals: {
      bloodPressure: '142/92',
      heartRate: 84,
      bloodSugar: 168,
    },
  },
];

export const medicationApi = {
  getMedications: async (patientId?: string): Promise<MedicationItem[]> => {
    try {
      const url = patientId
        ? `${API_BASE_URL}/api/medications?patientId=${patientId}`
        : `${API_BASE_URL}/api/medications`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const resData = await res.json();
      const list = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
      return list;
    } catch (error) {
      return [];
    }
  },

  addMedication: async (payload: {
    name: string;
    dosage: string;
    frequency?: string;
    scheduledTime: string;
    instructions?: string;
    purpose?: string;
    form?: string;
    meal?: string;
    stock?: number;
  }): Promise<MedicationItem> => {
    const res = await fetch(`${API_BASE_URL}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to add medication');
    return resData.data || resData;
  },

  updateMedication: async (
    id: string,
    payload: {
      name?: string;
      dosage?: string;
      frequency?: string;
      scheduledTime?: string;
      instructions?: string;
      purpose?: string;
      form?: string;
      meal?: string;
      stock?: number;
    }
  ): Promise<MedicationItem> => {
    const res = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to update medication');
    return resData.data || resData;
  },

  updateStatus: async (id: string, status: 'taken' | 'missed' | 'upcoming') => {
    const res = await fetch(`${API_BASE_URL}/api/medications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  deleteMedication: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete medication');
    }
  },
};

export const patientApi = {
  getPatients: async (): Promise<PatientItem[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients`);
      if (!res.ok) return DEFAULT_PATIENTS;
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : DEFAULT_PATIENTS;
    } catch (error) {
      return DEFAULT_PATIENTS;
    }
  },
};