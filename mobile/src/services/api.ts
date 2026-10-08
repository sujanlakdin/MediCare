import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api-config';

const TOKEN_KEY = 'medicare.access-token';

async function getAuthHeaders(): Promise<Record<string, string>> {
  let token: string | null = null;
  try {
    if (Platform.OS === 'web') {
      token = globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    } else {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch {}

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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
  patientId?: string;
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
      const headers = await getAuthHeaders();
      const url = patientId
        ? `${API_BASE_URL}/api/medications?patientId=${patientId}`
        : `${API_BASE_URL}/api/medications`;
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      const resData = await res.json();
      const list = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
      return list;
    } catch (error) {
      return [];
    }
  },

  addMedication: async (payload: {
    patientId?: string;
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
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/medications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || resData.message || 'Failed to add medication');
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
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || resData.message || 'Failed to update medication');
    return resData.data || resData;
  },

  updateStatus: async (id: string, status: 'taken' | 'missed' | 'upcoming') => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/medications/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  deleteMedication: async (id: string): Promise<void> => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/medications/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || 'Failed to delete medication');
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

export interface CaregiverNote {
  id: string;
  patientId: string;
  title: string;
  category: 'Vitals' | 'Diet' | 'Doctor Visit' | 'General';
  content: string;
  createdAt: string;
  author: string;
}

const INITIAL_NOTES: CaregiverNote[] = [
  {
    id: 'note-1',
    patientId: 'p-1',
    title: 'Afternoon BP & Pulse Check',
    category: 'Vitals',
    content: 'Blood Pressure: 122/80 mmHg, Pulse: 72 bpm. Patient in good spirits after evening walk.',
    createdAt: new Date().toISOString(),
    author: 'Caregiver Sarah',
  },
  {
    id: 'note-2',
    patientId: 'p-1',
    title: 'Dr. Patel Consultation Update',
    category: 'Doctor Visit',
    content: 'Doctor advised continuing Lisinopril 10mg. Next follow-up scheduled in 2 weeks.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    author: 'Caregiver Sarah',
  },
];

let inMemoryNotes: CaregiverNote[] = [...INITIAL_NOTES];

export const notesApi = {
  getNotes: async (patientId?: string): Promise<CaregiverNote[]> => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/notes${patientId ? `?patientId=${patientId}` : ''}`, { headers });
      if (!res.ok) return inMemoryNotes.filter((n) => !patientId || n.patientId === patientId);
      const data = await res.json();
      return Array.isArray(data) ? data : inMemoryNotes;
    } catch {
      return inMemoryNotes.filter((n) => !patientId || n.patientId === patientId);
    }
  },

  addNote: async (payload: Omit<CaregiverNote, 'id' | 'createdAt'>): Promise<CaregiverNote> => {
    const newNote: CaregiverNote = {
      ...payload,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        const resData = await res.json();
        const saved = resData.data || resData;
        inMemoryNotes.unshift(saved);
        return saved;
      }
    } catch {}
    inMemoryNotes.unshift(newNote);
    return newNote;
  },

  updateNote: async (id: string, payload: Partial<CaregiverNote>): Promise<CaregiverNote> => {
    inMemoryNotes = inMemoryNotes.map((n) => (n.id === id ? { ...n, ...payload } : n));
    const updated = inMemoryNotes.find((n) => n.id === id);
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
    } catch {}
    return updated || ({ ...payload, id } as CaregiverNote);
  },

  deleteNote: async (id: string): Promise<void> => {
    inMemoryNotes = inMemoryNotes.filter((n) => n.id !== id);
    try {
      const headers = await getAuthHeaders();
      await fetch(`${API_BASE_URL}/api/notes/${id}`, { method: 'DELETE', headers });
    } catch {}
  },
};