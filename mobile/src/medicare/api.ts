import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiRequest } from '@/services/api';

const TOKEN_KEY = 'medicare.access-token';

export interface ReminderRecord {
  _id: string;
  userId: string;
  medicationId: string;
  time: string;
  repeat: 'Every Day' | 'Weekdays' | 'Custom';
  startDate: string;
  snoozeEnabled: boolean;
  note: string;
}

export interface DoseLogRecord {
  _id: string;
  userId: string;
  medicationId: string;
  status: 'taken' | 'skipped';
  at: string;
  note: string;
  sideEffects: string[];
}

export type ReminderPayload = Pick<
  ReminderRecord,
  | 'medicationId'
  | 'time'
  | 'repeat'
  | 'startDate'
  | 'snoozeEnabled'
  | 'note'
>;

export type DoseLogPayload = Pick<
  DoseLogRecord,
  'medicationId' | 'status' | 'note' | 'sideEffects'
> & { at?: string };

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  const token =
    Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(TOKEN_KEY)
      : await SecureStore.getItemAsync(TOKEN_KEY);

  if (!token) {
    throw new Error('Please sign in before accessing medication data.');
  }

  return apiRequest<T>(path, {
    method,
    token,
    body,
  });
}

export const reminderApi = {
  list: () => request<ReminderRecord[]>('/api/reminders'),

  create: (body: ReminderPayload) =>
    request<ReminderRecord>('/api/reminders', 'POST', body),

  update: (id: string, body: Partial<ReminderPayload>) =>
    request<ReminderRecord>(
      `/api/reminders/${encodeURIComponent(id)}`,
      'PUT',
      body
    ),

  remove: (id: string) =>
    request<{ message: string }>(
      `/api/reminders/${encodeURIComponent(id)}`,
      'DELETE'
    ),
};

export const doseLogApi = {
  list: () => request<DoseLogRecord[]>('/api/dose-logs'),

  create: (body: DoseLogPayload) =>
    request<DoseLogRecord>('/api/dose-logs', 'POST', body),

  update: (
    id: string,
    body: Partial<Omit<DoseLogPayload, 'medicationId'>>
  ) =>
    request<DoseLogRecord>(
      `/api/dose-logs/${encodeURIComponent(id)}`,
      'PUT',
      body
    ),

  remove: (id: string) =>
    request<{ message: string }>(
      `/api/dose-logs/${encodeURIComponent(id)}`,
      'DELETE'
    ),
};