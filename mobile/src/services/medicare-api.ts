import { Platform } from 'react-native';

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
  dateOfBirth: string;
  gender: string;
  address: string;
  profilePhotoUrl?: string;
  emergencyContact: EmergencyContact;
};

export type Caregiver = {
  _id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  medicationAlerts: boolean;
  missedMedicationAlerts: boolean;
};

export type NotificationSettings = {
  medicationReminders: boolean;
  reminderSound: boolean;
  vibration: boolean;
  missedMedicationAlerts: boolean;
  caregiverNotifications: boolean;
  preferredReminderTime: string;
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

export async function uploadProfilePhoto(token: string, uri: string, fileName?: string) {
  const safeFileName = fileName || uri.split('/').pop() || 'profile-photo.jpg';
  const extension = safeFileName.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    formData.append('photo', blob, safeFileName);
  } else {
    formData.append('photo', {
      uri,
      name: safeFileName,
      type: mimeType,
    } as unknown as Blob);
  }

  return apiRequest<{ success: boolean; message: string; profilePhoto: string }>('/api/users/profile-photo', {
    method: 'PUT', token, body: formData, isFormData: true,
  });
}

export function removeProfilePhoto(token: string) {
  return apiRequest<{ success: boolean; message: string; profilePhoto: string }>('/api/users/profile-photo', {
    method: 'DELETE', token,
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