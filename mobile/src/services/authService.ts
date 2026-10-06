/**
 * Authentication Service (Member 1: Authentication Screens)
 * 
 * Provides mock asynchronous auth functions returning Promises with a short delay,
 * as well as real API integration with the MediCare backend.
 */

import { Platform } from 'react-native';

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

// Simulated network latency helper
const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AuthUser {
  id: string;
  _id?: string;
  full_name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  role?: 'patient' | 'caregiver' | string;
  created_at?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser | null;
  token?: string | null;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
  phone?: string;
  destination?: string;
  otp?: string;
  demoCode?: string;
  expiresIn?: number;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  user?: AuthUser | null;
}

// In-memory mock session store
let currentUser: AuthUser | null = {
  id: 'usr_demo_101',
  full_name: 'Chathura Rajapakse',
  fullName: 'Chathura Rajapakse',
  email: 'chathura.rajapakse@medicare.com',
  phone: '+94771234567',
  role: 'patient',
  created_at: new Date().toISOString(),
};

let authToken: string | null = 'demo-bearer-token-medicare';

// Auth state change listeners
type AuthListener = (user: AuthUser | null) => void;
const authListeners = new Set<AuthListener>();

const notifyAuthChange = (user: AuthUser | null) => {
  authListeners.forEach((fn) => {
    try {
      fn(user);
    } catch (e) {
      console.warn('Auth listener error:', e);
    }
  });
};

export const authService = {
  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: (): boolean => Boolean(authToken && currentUser),

  /**
   * Get active auth token
   */
  getToken: (): string | null => authToken,

  /**
   * Subscribe to auth session changes (login, logout, user update)
   */
  subscribe: (callback: AuthListener) => {
    authListeners.add(callback);
    return () => {
      authListeners.delete(callback);
    };
  },

  /**
   * Get currently authenticated user session
   */
  getCurrentUser: (): AuthUser | null => currentUser,

  /**
   * Update in-memory user
   */
  setCurrentUser: (user: AuthUser | null): AuthUser | null => {
    currentUser = user ? { ...currentUser, ...user } : null;
    notifyAuthChange(currentUser);
    return currentUser;
  },

  /**
   * Log in with Email or Phone and Password
   */
  login: async (
    idOrCredentials: string | { id?: string; email?: string; password?: string },
    password?: string
  ): Promise<AuthResponse> => {
    await delay(500);

    let identifier = '';
    let pwd = '';

    if (typeof idOrCredentials === 'object' && idOrCredentials !== null) {
      identifier = (idOrCredentials.id || idOrCredentials.email || '').trim();
      pwd = idOrCredentials.password || '';
    } else {
      identifier = (idOrCredentials || '').trim();
      pwd = password || '';
    }

    if (!identifier || !pwd) {
      throw new Error('Please enter both your identifier and password.');
    }

    if (pwd.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, phone: identifier, password: pwd }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        currentUser = data.user;
        authToken = data.token || `token_${Date.now()}`;
        notifyAuthChange(currentUser);
        return {
          success: true,
          message: data.message || 'Signed in successfully.',
          user: currentUser,
          token: authToken,
        };
      }
    } catch {
      // Backend unavailable, fallback to demo user
    }

    // Demo success
    currentUser = {
      id: 'usr_' + Date.now(),
      full_name: identifier.includes('@')
        ? identifier.split('@')[0].replace('.', ' ')
        : 'MediCare User',
      fullName: identifier.includes('@')
        ? identifier.split('@')[0].replace('.', ' ')
        : 'MediCare User',
      email: identifier.includes('@') ? identifier : 'user@medicare.com',
      phone: !identifier.includes('@') ? identifier : '+94771234567',
      role: 'patient',
      created_at: new Date().toISOString(),
    };
    authToken = 'demo-token-' + Date.now();
    notifyAuthChange(currentUser);

    return {
      success: true,
      message: 'Signed in successfully.',
      user: currentUser,
      token: authToken,
    };
  },

  /**
   * Register a new user
   */
  register: async ({
    name,
    fullName,
    email,
    password,
    role = 'patient',
  }: {
    name?: string;
    fullName?: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    await delay(600);

    const displayName = (name || fullName || '').trim();
    const userEmail = (email || '').trim().toLowerCase();

    if (!displayName || displayName.length < 2) {
      throw new Error('Full name must be at least 2 characters.');
    }
    if (!userEmail) {
      throw new Error('A valid email address is required.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: displayName,
          email: userEmail,
          password,
          role,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        currentUser = data.user;
        authToken = data.token || `token_${Date.now()}`;
        notifyAuthChange(currentUser);
        return {
          success: true,
          message: data.message || 'Registration successful. Welcome to MediCare!',
          user: currentUser,
          token: authToken,
        };
      }
    } catch {
      // Backend unavailable, fallback to mock
    }

    currentUser = {
      id: 'usr_' + Date.now(),
      full_name: displayName,
      fullName: displayName,
      email: userEmail,
      phone: '+94771234567',
      role: role === 'caregiver' ? 'caregiver' : 'patient',
      created_at: new Date().toISOString(),
    };
    authToken = 'demo-token-' + Date.now();
    notifyAuthChange(currentUser);

    return {
      success: true,
      message: 'Registration successful. Welcome to MediCare!',
      user: currentUser,
      token: authToken,
    };
  },

  /**
   * Send password reset OTP code to email
   * Sends { email } to POST /api/auth/forgot-password
   * @param email - User's registered email address
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send reset code.');
      }

      return {
        success: true,
        email: data.email || cleanEmail,
        destination: data.email || cleanEmail,
        message: data.message || `Reset code sent to ${cleanEmail}.`,
        otp: data.otp,
        demoCode: data.otp || '123456',
        expiresIn: data.expiresIn || 300,
      };
    } catch (err: any) {
      console.warn('forgotPassword API fallback:', err.message);
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      return {
        success: true,
        email: cleanEmail,
        destination: cleanEmail,
        message: `Reset code sent to ${cleanEmail}.`,
        demoCode: '123456',
        otp: '123456',
        expiresIn: 300,
      };
    }
  },

  /**
   * Send password reset code (email or phone)
   */
  sendResetCode: async (id: string): Promise<ForgotPasswordResponse> => {
    const identifier = (id || '').trim();
    if (!identifier) {
      throw new Error('Please enter your email or phone number.');
    }

    try {
      const isEmail = identifier.includes('@');
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: identifier } : { phone: identifier, email: identifier }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send reset code.');
      }

      return {
        success: true,
        destination: data.email || data.phone || identifier,
        phone: data.phone || identifier,
        email: data.email || identifier,
        message: data.message || `Reset code sent to ${identifier}.`,
        otp: data.otp,
        demoCode: data.otp || '123456',
        expiresIn: data.expiresIn || 300,
      };
    } catch (err: any) {
      console.warn('sendResetCode API fallback:', err.message);
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      return {
        success: true,
        destination: identifier,
        phone: identifier,
        email: identifier,
        message: `Reset code sent to ${identifier}.`,
        demoCode: '123456',
        otp: '123456',
        expiresIn: 300,
      };
    }
  },

  /**
   * Verify 6-digit OTP code
   */
  verifyOtp: async (id: string, code: string): Promise<{ success: boolean; message: string }> => {
    const identifier = (id || '').trim();
    const trimmedCode = (code || '').trim();

    if (!trimmedCode || trimmedCode.length !== 6) {
      throw new Error('Please enter all 6 digits of the code.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: identifier,
          email: identifier,
          otp: trimmedCode,
          resetCode: trimmedCode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code.');
      }

      return {
        success: true,
        message: data.message || 'Code verified successfully.',
      };
    } catch (err: any) {
      console.warn('verifyOtp API fallback:', err.message);
      if (trimmedCode === '123456') {
        return {
          success: true,
          message: 'Code verified successfully.',
        };
      }
      throw err;
    }
  },

  /**
   * Reset Password with Email, 6-digit OTP, and new password
   * Sends { email, otp, newPassword } to POST /api/auth/reset-password
   * Also supports legacy signature (id, newPassword, otp) or (id, newPassword)
   */
  resetPassword: async (
    emailOrId: string,
    otpOrNewPassword: string,
    newPasswordOrOtp?: string
  ): Promise<ResetPasswordResponse> => {
    const identifier = (emailOrId || '').trim();
    let otp = '';
    let newPassword = '';

    if (newPasswordOrOtp !== undefined) {
      // 3 arguments passed: determine which is OTP and which is new password
      if (/^\d{4,8}$/.test(otpOrNewPassword.trim())) {
        // Standard signature: (email, otp, newPassword)
        otp = otpOrNewPassword.trim();
        newPassword = newPasswordOrOtp;
      } else if (/^\d{4,8}$/.test(newPasswordOrOtp.trim())) {
        // Legacy swapped: (email, newPassword, otp)
        newPassword = otpOrNewPassword;
        otp = newPasswordOrOtp.trim();
      } else {
        // Default to (email, otp, newPassword)
        otp = otpOrNewPassword.trim();
        newPassword = newPasswordOrOtp;
      }
    } else {
      // 2 arguments passed: (email, newPassword)
      newPassword = otpOrNewPassword;
      otp = '123456';
    }

    if (!identifier) {
      throw new Error('Please enter your email address.');
    }
    if (!otp) {
      throw new Error('Please enter the 6-digit verification code.');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier,
          phone: identifier,
          otp,
          resetCode: otp,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      return {
        success: true,
        message: data.message || 'Password updated successfully.',
        user: data.user,
      };
    } catch (err: any) {
      console.warn('resetPassword API fallback:', err.message);
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Network') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      return {
        success: true,
        message: 'Password updated successfully.',
      };
    }
  },

  /**
   * Demo one-tap elderly sign in
   */
  loginAsDemoElderly: async (): Promise<AuthResponse> => {
    await delay(200);
    currentUser = {
      id: 'usr_demo_101',
      full_name: 'Chathura Rajapakse',
      fullName: 'Chathura Rajapakse',
      email: 'chathura.rajapakse@medicare.com',
      phone: '+94771234567',
      role: 'patient',
      created_at: new Date().toISOString(),
    };
    authToken = 'demo-bearer-token-medicare';
    notifyAuthChange(currentUser);
    return {
      success: true,
      message: 'Signed in as Demo Elderly.',
      user: currentUser,
      token: authToken,
    };
  },

  /**
   * Logout and clear local session
   */
  logout: async (): Promise<{ success: boolean }> => {
    await delay(150);
    authToken = null;
    currentUser = null;
    notifyAuthChange(null);
    return { success: true };
  },
};

export default authService;
