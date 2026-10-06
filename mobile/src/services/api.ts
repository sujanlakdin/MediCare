import { Platform } from 'react-native';

// Standard local IP or localhost depending on platform
const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'caregiver' | 'patient';
  phone?: string;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      return data as User;
    } catch (error: any) {
      throw new Error(error.message || 'Network error during login');
    }
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      return data as User;
    } catch (error: any) {
      throw new Error(error.message || 'Network error during registration');
    }
  },

  getProfile: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Network error fetching profile');
    }
  },
};

export interface MedicationItem {
  _id?: string;
  name: string;
  dosage: string;
  frequency?: string;
  scheduledTime: string;
  instructions?: string;
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

export const medicationApi = {
  getMedications: async (patientId?: string): Promise<MedicationItem[]> => {
    try {
      const url = patientId
        ? `${API_BASE_URL}/medications?patientId=${patientId}`
        : `${API_BASE_URL}/medications`;
      const res = await fetch(url);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
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
  }): Promise<MedicationItem> => {
    const res = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to add medication');
    }
    return data;
  },

  updateMedication: async (
    id: string,
    payload: {
      name?: string;
      dosage?: string;
      frequency?: string;
      scheduledTime?: string;
      instructions?: string;
    }
  ): Promise<MedicationItem> => {
    const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update medication');
    }
    return data;
  },

  updateStatus: async (id: string, status: 'taken' | 'missed' | 'upcoming') => {
    const res = await fetch(`${API_BASE_URL}/medications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  deleteMedication: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
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
      const res = await fetch(`${API_BASE_URL}/patients`);
      if (!res.ok) {
        return [];
      }
      return await res.json();
    } catch (error) {
      return [];
    }
  },
};

