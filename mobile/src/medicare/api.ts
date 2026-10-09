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
  dose?: string;
  instructions?: string;
  notificationSound?: string;
  snoozeCountRemaining?: number;
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

export interface MedicationRecord {
  _id: string;
  id?: string;
  user_id?: string;
  patientId?: string;
  name: string;
  purpose?: string;
  form?: 'Tablet' | 'Capsule' | 'Syrup';
  qty?: number;
  meal?: string;
  times?: string[];
  days?: number[];
  repeat?: string;
  start?: string;
  end?: string;
  stock?: number;
  alert?: boolean;
  taken?: Record<string, boolean>;
  image?: string;
}

interface MedicationResponse<T> {
  success: boolean;
  source?: string;
  data: T;
  message?: string;
}

export type MedicationPayload = Partial<
  Omit<MedicationRecord, '_id' | 'id' | 'user_id' | 'patientId'>
>;

export type ReminderPayload = Pick<
  ReminderRecord,
  | 'medicationId'
  | 'time'
  | 'repeat'
  | 'startDate'
  | 'snoozeEnabled'
  | 'note'
> & {
  dose?: string;
  instructions?: string;
  notificationSound?: string;
  snoozeCountRemaining?: number;
};

export type DoseLogPayload = Pick<
  DoseLogRecord,
  'medicationId' | 'status' | 'note' | 'sideEffects'
> & {
  at?: string;
};

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  sessionToken?: string
): Promise<T> {
  const token =
    sessionToken ??
    (Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(TOKEN_KEY)
      : await SecureStore.getItemAsync(TOKEN_KEY));

  if (!token) {
    throw new Error('Please sign in before accessing medication data.');
  }

  return apiRequest<T>(path, {
    method,
    token,
    body,
  });
}

function requireMongoDB<T>(
  response: MedicationResponse<T>
): T {
  if (!response.success || response.source !== 'mongodb') {
    throw new Error(
      'Medication data could not be saved or loaded from MongoDB. ' +
      'Check the backend database connection and try again.'
    );
  }

  return response.data;
}

export const medicareMedicationApi = {
  list: async (token?: string): Promise<MedicationRecord[]> => {
    const response = await request<
      MedicationResponse<MedicationRecord[]>
    >('/api/medications', 'GET', undefined, token);

    const records = requireMongoDB(response);

    if (!Array.isArray(records)) {
      throw new Error('The medication response is invalid.');
    }

    return records;
  },

  create: async (
    body: MedicationPayload,
    token?: string
  ): Promise<MedicationRecord> => {
    const response = await request<
      MedicationResponse<MedicationRecord>
    >('/api/medications', 'POST', body, token);

    return requireMongoDB(response);
  },

  update: async (
    id: string,
    body: MedicationPayload,
    token?: string
  ): Promise<MedicationRecord> => {
    const response = await request<
      MedicationResponse<MedicationRecord>
    >(
      `/api/medications/${encodeURIComponent(id)}`,
      'PUT',
      body,
      token
    );

    return requireMongoDB(response);
  },

  remove: async (
    id: string,
    token?: string
  ): Promise<void> => {
    const response = await request<{
      success: boolean;
      message?: string;
    }>(
      `/api/medications/${encodeURIComponent(id)}`,
      'DELETE',
      undefined,
      token
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Failed to delete medication.'
      );
    }
  },
};

export const reminderApi = {
  list: (token?: string) =>
    request<ReminderRecord[]>(
      '/api/reminders',
      'GET',
      undefined,
      token
    ),

  create: (body: ReminderPayload, token?: string) =>
    request<ReminderRecord>(
      '/api/reminders',
      'POST',
      body,
      token
    ),

  update: (
    id: string,
    body: Partial<ReminderPayload>,
    token?: string
  ) =>
    request<ReminderRecord>(
      `/api/reminders/${encodeURIComponent(id)}`,
      'PUT',
      body,
      token
    ),

  remove: (id: string, token?: string) =>
    request<{ message: string }>(
      `/api/reminders/${encodeURIComponent(id)}`,
      'DELETE',
      undefined,
      token
    ),
};

export const doseLogApi = {
  list: (token?: string) =>
    request<DoseLogRecord[]>(
      '/api/dose-logs',
      'GET',
      undefined,
      token
    ),

  create: (body: DoseLogPayload, token?: string) =>
    request<DoseLogRecord>(
      '/api/dose-logs',
      'POST',
      body,
      token
    ),

  update: (
    id: string,
    body: Partial<Omit<DoseLogPayload, 'medicationId'>>,
    token?: string
  ) =>
    request<DoseLogRecord>(
      `/api/dose-logs/${encodeURIComponent(id)}`,
      'PUT',
      body,
      token
    ),

  remove: (id: string, token?: string) =>
    request<{ message: string }>(
      `/api/dose-logs/${encodeURIComponent(id)}`,
      'DELETE',
      undefined,
      token
    ),
};