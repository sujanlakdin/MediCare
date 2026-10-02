import { apiRequest } from '@/services/api';

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

export type Profile = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  address: string;
  medicalId?: string;
  profileImage?: string;
  emergencyContact?: EmergencyContact;
};

export type Caregiver = {
  _id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
  medicationAlerts?: boolean;
  missedMedicationAlerts?: boolean;
  active?: boolean;
  dailyAdherenceSummary?: boolean;
  avatar?: string;
};

export type NotificationSettings = {
  medicationReminders: boolean;
  reminderSound: boolean;
  vibration: boolean;
  missedMedicationAlerts: boolean;
  caregiverNotifications: boolean;
  preferredReminderTime: string;
  missedDoseAlerts: boolean;
  caregiverSync: boolean;
  soundAssistance: boolean;
  vibrationMode: boolean;
  morningReminderTime: string;
  noonReminderTime: string;
  eveningReminderTime: string;
};

export type AccessibilitySettings = {
  fontSize: 'standard' | 'large' | 'extraLarge';
  highContrast: boolean;
  largerButtons: boolean;
  largerTouchTargets: boolean;
  voiceAssistance: boolean;
  reduceMotion: boolean;
  simpleLanguage: boolean;
};

export type ProfileChanges = Partial<Omit<Profile, '_id' | 'emergencyContact'>>;


export function getProfile(token: string) {
  return apiRequest<{ profile: Profile }>('/api/users/profile', { token });
}

export function updateProfile(token: string, changes: ProfileChanges) {
  return apiRequest<{ profile: Profile }>('/api/users/profile', {
    method: 'PUT', token, body: changes,
  });
}

export function getCaregivers(token: string) {
  return apiRequest<{ caregivers: Caregiver[] }>('/api/caregivers', { token });
}

export function createCaregiver(token: string, caregiver: Omit<Caregiver, '_id'>) {
  return apiRequest<{ caregiver: Caregiver }>('/api/caregivers', {
    method: 'POST', token, body: caregiver,
  });
}

export function updateCaregiver(token: string, id: string, changes: Partial<Caregiver>) {
  return apiRequest<{ caregiver: Caregiver }>(`/api/caregivers/${encodeURIComponent(id)}`, {
    method: 'PUT', token, body: changes,
  });
}

export function removeCaregiver(token: string, id: string) {
  return apiRequest<void>(`/api/caregivers/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}

export function getNotifications(token: string) {
  return apiRequest<{ settings: NotificationSettings }>('/api/users/notification-settings', { token });
}

export function updateNotifications(token: string, settings: Partial<NotificationSettings>) {
  return apiRequest<{ settings: NotificationSettings }>('/api/users/notification-settings', {
    method: 'PUT', token, body: settings,
  });
}

export function getEmergencyContact(token: string) {
  return apiRequest<{ emergencyContact: EmergencyContact }>('/api/users/emergency-contact', { token });
}

export function updateEmergencyContact(token: string, contact: EmergencyContact) {
  return apiRequest<{ emergencyContact: EmergencyContact }>('/api/users/emergency-contact', {
    method: 'PUT', token, body: contact,
  });
}

export function getAccessibilitySettings(token: string) {
  return apiRequest<{ settings: AccessibilitySettings }>('/api/users/accessibility-settings', { token });
}

export function updateAccessibilitySettings(token: string, settings: Partial<AccessibilitySettings>) {
  return apiRequest<{ settings: AccessibilitySettings }>('/api/users/accessibility-settings', {
    method: 'PUT', token, body: settings,
  });
}

export function submitSupport(token: string, payload: { subject: string; description: string }) {
  return apiRequest<{ id: string; message: string }>('/api/support', {
    method: 'POST', token, body: payload,
  });
}