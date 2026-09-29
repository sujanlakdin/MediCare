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
