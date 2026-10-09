import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useFocusEffect } from 'expo-router';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/contexts/auth-context';
import {
  calculateAdherence,
  type AdherenceStats,
} from './adherence-calculations';
import type {
  Medication,
  Reminder,
  DoseLog,
  ScheduleItem,
  TimeOfDayGroup,
} from './types';
import {
  medicareMedicationApi,
  reminderApi,
  doseLogApi,
  type MedicationRecord,
  type ReminderRecord,
  type DoseLogRecord,
} from './api';

type Session = {
  token: string;
  userId: string;
  generation: number;
};

type StoreSnapshot = {
  token: string | null;
  userId: string | null;
  medications: Medication[];
  reminders: Reminder[];
  doseLogs: DoseLog[];
  schedule: ScheduleItem[];
  loaded: boolean;
  loading: boolean;
  error: string;
};

let medications: Medication[] = [];
let reminders: Reminder[] = [];
let doseLogs: DoseLog[] = [];
let medicationRecords: MedicationRecord[] = [];

let session: Session | null = null;
let generation = 0;
let loaded = false;
let loading = false;
let loadError = '';
let queue: Promise<unknown> = Promise.resolve();

const listeners = new Set<() => void>();

let snapshot: StoreSnapshot = {
  token: null,
  userId: null,
  medications: [],
  reminders: [],
  doseLogs: [],
  schedule: [],
  loaded: false,
  loading: false,
  error: '',
};

function getSnapshot() {
  return snapshot;
}

function notify() {
  snapshot = {
    token: session?.token ?? null,
    userId: session?.userId ?? null,
    medications: medications.map((med) => ({ ...med })),
    reminders: reminders.map((reminder) => ({ ...reminder })),
    doseLogs: doseLogs.map((log) => ({
      ...log,
      sideEffects: [...(log.sideEffects || [])],
    })),
    schedule: computeScheduleItems(),
    loaded,
    loading,
    error: loadError,
  };

  listeners.forEach((listener) => listener());
}

export function subscribeToMedicareStore(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function localDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function isToday(at: string) {
  const date = new Date(at);

  return (
    !Number.isNaN(date.getTime()) &&
    localDate(date) === localDate()
  );
}

function to24(time: string) {
  const match = time
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (!match) {
    throw new Error('Select a valid reminder time.');
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    minute > 59 ||
    (match[3] ? hour < 1 || hour > 12 : hour > 23)
  ) {
    throw new Error('Select a valid reminder time.');
  }

  if (match[3]) {
    hour =
      hour % 12 +
      (match[3].toUpperCase() === 'PM' ? 12 : 0);
  }

  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function to12(time: string) {
  const [hour, minute] = to24(time).split(':');
  const h = Number(hour);

  return `${String(h % 12 || 12).padStart(2, '0')}:${minute} ${
    h < 12 ? 'AM' : 'PM'
  }`;
}

export function getTimeOfDayGroup(
  time: string
): TimeOfDayGroup {
  const hour = Number(to24(time).split(':')[0]);

  if (hour >= 4 && hour < 12) return 'MORNING';
  if (hour >= 12 && hour < 17) return 'AFTERNOON';

  return 'EVENING';
}

function configure(
  token: string | null,
  userId: string | null
) {
  if (
    session?.token === token &&
    session?.userId === userId
  ) {
    return;
  }

  if (!session && !token && !userId) return;

  generation += 1;
  session = token && userId
    ? { token, userId, generation }
    : null;

  medications = [];
  reminders = [];
  doseLogs = [];
  medicationRecords = [];
  loaded = false;
  loading = false;
  loadError = '';

  notify();
}

function assertSession(captured: Session) {
  if (session?.generation !== captured.generation) {
    throw new Error(
      'Your account changed. Please reopen this screen.'
    );
  }
}

async function currentSession(): Promise<Session> {
  const captured = session;

  if (!captured) {
    throw new Error('Please sign in to manage reminders.');
  }

  const stored = Platform.OS === 'web'
    ? globalThis.localStorage?.getItem('medicare.access-token')
    : await SecureStore.getItemAsync('medicare.access-token');

  assertSession(captured);

  if (stored !== captured.token) {
    configure(null, null);
    throw new Error(
      'Your session changed. Please sign in again.'
    );
  }

  return captured;
}

function run<T>(operation: () => Promise<T>): Promise<T> {
  const expectedGeneration = session?.generation;

  const result = queue.then(() => {
    if (session?.generation !== expectedGeneration) {
      throw new Error(
        'Your account changed. Please reopen this screen.'
      );
    }

    return operation();
  });

  queue = result.catch(() => undefined);
  return result;
}

function mapReminder(record: ReminderRecord): Reminder {
  return {
    id: record._id,
    medicationId: record.medicationId,
    time: to12(record.time),
    repeat: record.repeat,
    startDate: record.startDate,
    snoozeEnabled: record.snoozeEnabled,
    note: record.note || '',
    notificationSound: record.notificationSound,
    snoozeCountRemaining: record.snoozeCountRemaining ?? 2,
  };
}

function mapLog(record: DoseLogRecord): DoseLog {
  return {
    id: record._id,
    medicationId: record.medicationId,
    status: record.status,
    takenAt: record.at,
    note: record.note || '',
    sideEffects: [...(record.sideEffects || [])],
  };
}

function mapMedication(
  record: MedicationRecord,
  reminder?: ReminderRecord
): Medication {
  return {
    id: record._id,
    name: record.name,
    dose: reminder?.dose ||
      `${record.qty ?? 1} ${record.form || 'Tablet'}`,
    instructions:
      reminder?.instructions ?? record.meal ?? '',
    timeOfDayGroup: getTimeOfDayGroup(
      reminder?.time || record.times?.[0] || '08:00'
    ),
    iconType: record.form === 'Syrup' ? 'water' : 'pill',
  };
}

async function load(captured: Session) {
  assertSession(captured);
  loading = true;
  loadError = '';
  notify();

  try {
    const [meds, rems, logs] = await Promise.all([
      medicareMedicationApi.list(captured.token),
      reminderApi.list(captured.token),
      doseLogApi.list(captured.token),
    ]);

    assertSession(captured);

    const owned = meds.filter(
      (med) => String(med.user_id) === captured.userId
    );

    const ids = new Set(owned.map((med) => med._id));

    const ownedRems = rems.filter(
      (reminder) =>
        reminder.userId === captured.userId &&
        ids.has(reminder.medicationId)
    );

    medicationRecords = owned;

    medications = owned.map((med) =>
      mapMedication(
        med,
        ownedRems.find(
          (reminder) => reminder.medicationId === med._id
        )
      )
    );

    reminders = ownedRems.map(mapReminder);

    doseLogs = logs
      .filter(
        (log) =>
          log.userId === captured.userId &&
          ids.has(log.medicationId)
      )
      .map(mapLog);

    loaded = true;
  } catch (error) {
    if (session?.generation === captured.generation) {
      loadError = error instanceof Error
        ? error.message
        : 'Failed to load medication data.';
    }

    throw error;
  } finally {
    if (session?.generation === captured.generation) {
      loading = false;
      notify();
    }
  }
}

export function refreshMedicareStore() {
  return run(async () => {
    await load(await currentSession());
  });
}

async function ready() {
  const captured = await currentSession();

  if (!loaded) {
    await load(captured);
  }

  return captured;
}

function requireMedication(id: string) {
  const med = medications.find((item) => item.id === id);

  if (!med) {
    throw new Error('Medication not found for your account.');
  }

  return med;
}

function validateMedication(med: Omit<Medication, 'id'>) {
  if (
    med.name.trim().length < 2 ||
    med.name.trim().length > 40
  ) {
    throw new Error(
      'Name must be between 2 and 40 characters.'
    );
  }

  if (!med.dose.trim() || med.dose.length > 40) {
    throw new Error(
      'Dose is required and must be 40 characters or less.'
    );
  }

  if (med.instructions.length > 500) {
    throw new Error(
      'Instructions must be 500 characters or less.'
    );
  }
}

export function createMedication(
  med: Omit<Medication, 'id'>
): Promise<Medication> {
  return run(async () => {
    const captured = await ready();
    validateMedication(med);

    const saved = await medicareMedicationApi.create(
      {
        name: med.name.trim(),
        meal: med.instructions.trim(),
      },
      captured.token
    );

    assertSession(captured);

    if (String(saved.user_id) !== captured.userId) {
      throw new Error(
        'Medication ownership could not be verified.'
      );
    }

    const item: Medication = {
      ...med,
      name: saved.name,
      id: saved._id,
    };

    medicationRecords = [saved, ...medicationRecords];
    medications = [item, ...medications];
    notify();

    return { ...item };
  });
}

export function updateMedication(
  id: string,
  updates: Partial<Omit<Medication, 'id'>>
): Promise<Medication> {
  return run(async () => {
    const captured = await ready();
    const item: Medication = {
      ...requireMedication(id),
      ...updates,
    };

    validateMedication(item);

    const saved = await medicareMedicationApi.update(
      id,
      {
        name: item.name.trim(),
        meal: item.instructions.trim(),
      },
      captured.token
    );

    assertSession(captured);

    if (String(saved.user_id) !== captured.userId) {
      throw new Error(
        'Medication ownership could not be verified.'
      );
    }

    medications = medications.map(
      (med) => med.id === id ? item : med
    );
    medicationRecords = medicationRecords.map(
      (med) => med._id === id ? saved : med
    );
    notify();

    return { ...item };
  });
}

export function deleteMedication(id: string): Promise<boolean> {
  return run(async () => {
    const captured = await ready();
    requireMedication(id);

    await medicareMedicationApi.list(captured.token);
    assertSession(captured);

    const relatedReminders = reminders.filter(
      (item) => item.medicationId === id
    );

    for (const reminder of relatedReminders) {
      await reminderApi.remove(reminder.id, captured.token);
      assertSession(captured);
      reminders = reminders.filter(
        (item) => item.id !== reminder.id
      );
      notify();
    }

    const relatedLogs = doseLogs.filter(
      (item) => item.medicationId === id
    );

    for (const log of relatedLogs) {
      await doseLogApi.remove(log.id, captured.token);
      assertSession(captured);
      doseLogs = doseLogs.filter(
        (item) => item.id !== log.id
      );
      notify();
    }

    await medicareMedicationApi.remove(id, captured.token);
    assertSession(captured);

    medications = medications.filter((med) => med.id !== id);
    medicationRecords = medicationRecords.filter(
      (med) => med._id !== id
    );
    notify();

    return true;
  });
}

function reminderPayload(reminder: Omit<Reminder, 'id'>) {
  const med = requireMedication(reminder.medicationId);

  return {
    medicationId: reminder.medicationId,
    time: to24(reminder.time),
    repeat: reminder.repeat,
    startDate: reminder.startDate,
    snoozeEnabled: reminder.snoozeEnabled,
    note: reminder.note,
    dose: med.dose,
    instructions: med.instructions,
    notificationSound:
      reminder.notificationSound || 'Morning Dew',
    snoozeCountRemaining:
      reminder.snoozeCountRemaining ?? 2,
  };
}

export function createReminder(
  reminder: Omit<Reminder, 'id'>
): Promise<Reminder> {
  return run(async () => {
    const captured = await ready();

    const saved = mapReminder(
      await reminderApi.create(
        reminderPayload(reminder),
        captured.token
      )
    );

    assertSession(captured);
    reminders = [...reminders, saved];
    notify();

    return { ...saved };
  });
}

export function updateReminder(
  id: string,
  updates: Partial<Omit<Reminder, 'id'>>
): Promise<Reminder> {
  return run(async () => {
    const captured = await ready();
    const existing = reminders.find(
      (reminder) => reminder.id === id
    );

    if (!existing) throw new Error('Reminder not found.');

    const saved = mapReminder(
      await reminderApi.update(
        id,
        reminderPayload({ ...existing, ...updates }),
        captured.token
      )
    );

    assertSession(captured);
    reminders = reminders.map(
      (reminder) => reminder.id === id ? saved : reminder
    );
    notify();

    return { ...saved };
  });
}

export function deleteReminder(id: string): Promise<boolean> {
  return run(async () => {
    const captured = await ready();

    if (!reminders.some((reminder) => reminder.id === id)) {
      throw new Error('Reminder not found.');
    }

    await reminderApi.remove(id, captured.token);
    assertSession(captured);
    reminders = reminders.filter(
      (reminder) => reminder.id !== id
    );
    notify();

    return true;
  });
}

export function getTodayDoseLog(
  medicationId: string
): DoseLog | null {
  const found = doseLogs.find(
    (log) =>
      log.medicationId === medicationId &&
      isToday(log.takenAt)
  );

  return found
    ? { ...found, sideEffects: [...(found.sideEffects || [])] }
    : null;
}

type DoseOptions = {
  note?: string;
  sideEffects?: string[];
  takenAt?: string;
  reminderId?: string;
};

function recordDose(
  medicationId: string,
  status: 'taken' | 'skipped',
  options?: DoseOptions
): Promise<DoseLog> {
  return run(async () => {
    const captured = await ready();
    requireMedication(medicationId);

    const existing = getTodayDoseLog(medicationId);

    const payload = {
      status,
      note: options?.note ?? existing?.note ??
        (status === 'skipped' ? 'Skipped dose' : ''),
      sideEffects: options?.sideEffects ??
        (status === 'taken' ? existing?.sideEffects || [] : []),
      at: options?.takenAt || new Date().toISOString(),
    };

    const record = existing
      ? await doseLogApi.update(
          existing.id,
          payload,
          captured.token
        )
      : await doseLogApi.create(
          { medicationId, ...payload },
          captured.token
        );

    assertSession(captured);
    const saved = mapLog(record);

    doseLogs = [
      saved,
      ...doseLogs.filter((log) => log.id !== saved.id),
    ];
    notify();

    return saved;
  });
}

export function markTaken(
  medicationId: string,
  options?: DoseOptions
) {
  return recordDose(medicationId, 'taken', options);
}

export function markSkipped(
  medicationId: string,
  options?: { note?: string; reminderId?: string }
) {
  return recordDose(medicationId, 'skipped', options);
}

export function updateDoseLog(
  id: string,
  updates: { note?: string; sideEffects?: string[] }
): Promise<DoseLog> {
  return run(async () => {
    const captured = await ready();

    if (!doseLogs.some((log) => log.id === id)) {
      throw new Error('Dose log not found.');
    }

    const saved = mapLog(
      await doseLogApi.update(id, updates, captured.token)
    );

    assertSession(captured);
    doseLogs = doseLogs.map(
      (log) => log.id === id ? saved : log
    );
    notify();

    return saved;
  });
}

export function deleteDoseLog(id: string): Promise<boolean> {
  return run(async () => {
    const captured = await ready();

    if (!doseLogs.some((log) => log.id === id)) {
      throw new Error('Dose log not found.');
    }

    await doseLogApi.remove(id, captured.token);
    assertSession(captured);
    doseLogs = doseLogs.filter((log) => log.id !== id);
    notify();

    return true;
  });
}

export async function undoDoseLog(
  medicationId: string
): Promise<boolean> {
  const logs = (await getDoseLogs()).filter(
    (log) =>
      log.medicationId === medicationId &&
      isToday(log.takenAt)
  );

  for (const log of logs) {
    await deleteDoseLog(log.id);
  }

  return logs.length > 0;
}

export async function snoozeReminder(
  id: string,
  _minutes = 15
): Promise<Reminder | null> {
  const reminder = await getReminderById(id);

  if (!reminder) return null;

  return updateReminder(id, {
    snoozeCountRemaining: Math.max(
      0,
      (reminder.snoozeCountRemaining ?? 2) - 1
    ),
  });
}

export function getMedications(): Promise<Medication[]> {
  return run(async () => {
    await ready();
    return medications.map((med) => ({ ...med }));
  });
}

export async function getMedicationById(
  id: string
): Promise<Medication | null> {
  return (await getMedications()).find(
    (med) => med.id === id
  ) || null;
}

export function getReminders(): Promise<Reminder[]> {
  return run(async () => {
    await ready();
    return reminders.map((reminder) => ({ ...reminder }));
  });
}

export async function getReminderById(
  id: string
): Promise<Reminder | null> {
  return (await getReminders()).find(
    (reminder) => reminder.id === id
  ) || null;
}

export async function getReminderByMedicationId(
  id: string
): Promise<Reminder | null> {
  return (await getReminders()).find(
    (reminder) => reminder.medicationId === id
  ) || null;
}

export function getDoseLogs(): Promise<DoseLog[]> {
  return run(async () => {
    await ready();

    return doseLogs.map((log) => ({
      ...log,
      sideEffects: [...(log.sideEffects || [])],
    }));
  });
}

export function computeScheduleItems(): ScheduleItem[] {
  const today = localDate();

  return medications.map((med) => {
    const reminder = reminders.find(
      (item) => item.medicationId === med.id
    );
    const record = medicationRecords.find(
      (item) => item._id === med.id
    );
    const log = getTodayDoseLog(med.id);

    const time = reminder?.time ||
      to12(record?.times?.[0] || '08:00');

    const startDate =
      reminder?.startDate || record?.start || today;

    const isFuture = startDate > today;

    let status: ScheduleItem['status'] =
      isFuture ? 'UPCOMING' : 'DUE_SOON';

    if (log?.status === 'taken') {
      status = 'TAKEN';
    } else if (log?.status === 'skipped') {
      status = 'SKIPPED';
    } else if (log?.status === 'missed') {
      status = 'MISSED';
    }

    const nextTime = status === 'TAKEN'
      ? `Next: Tomorrow, ${time}`
      : isFuture
        ? `Starts: ${startDate}, ${time}`
        : `Next: Today, ${time}`;

    return {
      id: med.id,
      medicationId: med.id,
      reminderId: reminder?.id || '',
      name: med.name,
      dosage: med.dose,
      instructions: med.instructions,
      status,
      time,
      nextTime,
      period: getTimeOfDayGroup(time),
      iconType: med.iconType || 'pill',
      note: reminder?.note || '',
      snoozeEnabled: reminder?.snoozeEnabled ?? true,
      startDate,
      repeat: reminder?.repeat || 'Every Day',
    };
  });
}

export function computeAdherenceStats(
  range: '7d' | '30d'
): AdherenceStats {
  return calculateAdherence(
    medications,
    reminders,
    doseLogs,
    range
  );
}

export function useMedicareStore() {
  const { token, user } = useAuth();
  const userId = user?.id || null;

  const state = useSyncExternalStore(
    subscribeToMedicareStore,
    getSnapshot,
    getSnapshot
  );

  useEffect(() => {
    configure(token, userId);
  }, [token, userId]);

  useFocusEffect(
    useCallback(() => {
      configure(token, userId);

      if (token && userId) {
        void refreshMedicareStore().catch(() => undefined);
      }
    }, [token, userId])
  );

  const matches = Boolean(
    token &&
    userId &&
    state.token === token &&
    state.userId === userId
  );

  return {
    medications: matches ? state.medications : [],
    reminders: matches ? state.reminders : [],
    doseLogs: matches ? state.doseLogs : [],
    schedule: matches ? state.schedule : [],
    isLoading: matches
      ? state.loading || (!state.loaded && !state.error)
      : Boolean(token && userId),
    error: matches ? state.error : '',
    refresh: refreshMedicareStore,
    computeAdherenceStats: (range: '7d' | '30d') =>
      matches
        ? calculateAdherence(
            state.medications,
            state.reminders,
            state.doseLogs,
            range
          )
        : calculateAdherence([], [], [], range),
  };
}