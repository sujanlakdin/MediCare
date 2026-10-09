import { useState, useEffect } from 'react';
import {
  Medication,
  Reminder,
  DoseLog,
  ScheduleItem,
  TimeOfDayGroup,
  PeriodData,
} from './types';
import {
  INITIAL_MEDICATIONS,
  INITIAL_REMINDERS,
  INITIAL_DOSE_LOGS,
} from './mockData';

// Use the device's local calendar date.
function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Convert an ISO timestamp to its local calendar date before comparing.
function isLogOnDate(
  takenAt: string | null | undefined,
  dateKey: string
): boolean {
  if (!takenAt) return false;

  const date = new Date(takenAt);

  return (
    !Number.isNaN(date.getTime()) &&
    getLocalDateKey(date) === dateKey
  );
}

// In-memory store state.
// Changes still reset when the app reloads.
let medications: Medication[] = [...INITIAL_MEDICATIONS];
let reminders: Reminder[] = [...INITIAL_REMINDERS];
let doseLogs: DoseLog[] = [...INITIAL_DOSE_LOGS];

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Error notifying medicare listener', error);
    }
  });
}

export function subscribeToMedicareStore(
  listener: () => void
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Determine Morning / Afternoon / Evening from a reminder time.
 */
export function getTimeOfDayGroup(
  timeStr: string
): TimeOfDayGroup {
  if (!timeStr) return 'MORNING';

  const match = timeStr
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (!match) return 'MORNING';

  let hour = parseInt(match[1], 10);
  const ampm = (match[3] || 'AM').toUpperCase();

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  if (hour >= 4 && hour < 12) return 'MORNING';
  if (hour >= 12 && hour < 17) return 'AFTERNOON';

  return 'EVENING';
}

// ---------------------------------------------------------------------------
// 1. Medications CRUD
// ---------------------------------------------------------------------------

export async function createMedication(
  med: Omit<Medication, 'id'>
): Promise<Medication> {
  const newMed: Medication = {
    ...med,
    id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };

  medications = [...medications, newMed];
  notifyListeners();

  return newMed;
}

export async function getMedications(): Promise<Medication[]> {
  return [...medications];
}

export async function getMedicationById(
  id: string
): Promise<Medication | null> {
  const found = medications.find((med) => med.id === id);

  return found ? { ...found } : null;
}

export async function updateMedication(
  id: string,
  updates: Partial<Omit<Medication, 'id'>>
): Promise<Medication> {
  const index = medications.findIndex((med) => med.id === id);

  if (index === -1) {
    throw new Error(`Medication with id ${id} not found`);
  }

  const updated: Medication = {
    ...medications[index],
    ...updates,
  };

  medications = [
    ...medications.slice(0, index),
    updated,
    ...medications.slice(index + 1),
  ];

  notifyListeners();

  return updated;
}

export async function deleteMedication(
  id: string
): Promise<boolean> {
  const initialLength = medications.length;

  medications = medications.filter((med) => med.id !== id);

  // Deleting a medication also removes its reminders and dose logs.
  reminders = reminders.filter(
    (reminder) => reminder.medicationId !== id
  );
  doseLogs = doseLogs.filter(
    (log) => log.medicationId !== id
  );

  const deleted = medications.length < initialLength;

  if (deleted) notifyListeners();

  return deleted;
}

// ---------------------------------------------------------------------------
// 2. Reminders CRUD
// ---------------------------------------------------------------------------

export async function createReminder(
  reminder: Omit<Reminder, 'id'>
): Promise<Reminder> {
  const newReminder: Reminder = {
    ...reminder,
    id: `rem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    snoozeCountRemaining: reminder.snoozeCountRemaining ?? 2,
  };

  reminders = [...reminders, newReminder];
  notifyListeners();

  return newReminder;
}

export async function getReminders(): Promise<Reminder[]> {
  return [...reminders];
}

export async function getReminderById(
  id: string
): Promise<Reminder | null> {
  const found = reminders.find((reminder) => reminder.id === id);

  return found ? { ...found } : null;
}

export async function getReminderByMedicationId(
  medicationId: string
): Promise<Reminder | null> {
  const found = reminders.find(
    (reminder) => reminder.medicationId === medicationId
  );

  return found ? { ...found } : null;
}

export async function updateReminder(
  id: string,
  updates: Partial<Omit<Reminder, 'id'>>
): Promise<Reminder> {
  const index = reminders.findIndex(
    (reminder) => reminder.id === id
  );

  if (index === -1) {
    throw new Error(`Reminder with id ${id} not found`);
  }

  const updated: Reminder = {
    ...reminders[index],
    ...updates,
  };

  reminders = [
    ...reminders.slice(0, index),
    updated,
    ...reminders.slice(index + 1),
  ];

  notifyListeners();

  return updated;
}

export async function deleteReminder(
  id: string
): Promise<boolean> {
  const initialLength = reminders.length;

  reminders = reminders.filter(
    (reminder) => reminder.id !== id
  );

  const deleted = reminders.length < initialLength;

  if (deleted) notifyListeners();

  return deleted;
}

// ---------------------------------------------------------------------------
// 3. Dose Logging and Undo
// ---------------------------------------------------------------------------

export async function markTaken(
  medicationId: string,
  options?: {
    note?: string;
    sideEffects?: string[];
    takenAt?: string;
    reminderId?: string;
  }
): Promise<DoseLog> {
  const today = getLocalDateKey();

  const existingIndex = doseLogs.findIndex(
    (log) =>
      log.medicationId === medicationId &&
      isLogOnDate(log.takenAt, today)
  );

  const existingLog =
    existingIndex !== -1 ? doseLogs[existingIndex] : undefined;

  const reminder = reminders.find(
    (item) => item.medicationId === medicationId
  );

  const newLog: DoseLog = {
    id:
      existingLog?.id ||
      `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    medicationId,
    reminderId: options?.reminderId || reminder?.id,
    status: 'taken',
    takenAt: options?.takenAt || new Date().toISOString(),
    note:
      options?.note !== undefined
        ? options.note
        : existingLog?.note || '',
    sideEffects:
      options?.sideEffects !== undefined
        ? options.sideEffects
        : existingLog?.sideEffects || [],
  };

  if (existingIndex !== -1) {
    doseLogs = [
      ...doseLogs.slice(0, existingIndex),
      newLog,
      ...doseLogs.slice(existingIndex + 1),
    ];
  } else {
    doseLogs = [newLog, ...doseLogs];
  }

  notifyListeners();

  return newLog;
}

export async function markSkipped(
  medicationId: string,
  options?: {
    note?: string;
    reminderId?: string;
  }
): Promise<DoseLog> {
  const today = getLocalDateKey();

  const existingIndex = doseLogs.findIndex(
    (log) =>
      log.medicationId === medicationId &&
      isLogOnDate(log.takenAt, today)
  );

  const existingLog =
    existingIndex !== -1 ? doseLogs[existingIndex] : undefined;

  const reminder = reminders.find(
    (item) => item.medicationId === medicationId
  );

  const newLog: DoseLog = {
    id:
      existingLog?.id ||
      `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    medicationId,
    reminderId: options?.reminderId || reminder?.id,
    status: 'skipped',
    takenAt: new Date().toISOString(),
    note: options?.note || 'Skipped dose',
    sideEffects: [],
  };

  if (existingIndex !== -1) {
    doseLogs = [
      ...doseLogs.slice(0, existingIndex),
      newLog,
      ...doseLogs.slice(existingIndex + 1),
    ];
  } else {
    doseLogs = [newLog, ...doseLogs];
  }

  notifyListeners();

  return newLog;
}

export async function undoDoseLog(
  medicationId: string
): Promise<boolean> {
  const today = getLocalDateKey();
  const initialLength = doseLogs.length;

  doseLogs = doseLogs.filter(
    (log) =>
      !(
        log.medicationId === medicationId &&
        isLogOnDate(log.takenAt, today)
      )
  );

  const removed = doseLogs.length < initialLength;

  if (removed) notifyListeners();

  return removed;
}

export async function snoozeReminder(
  reminderId: string,
  _minutes = 15
): Promise<Reminder | null> {
  const reminder = reminders.find(
    (item) => item.id === reminderId
  );

  if (!reminder) return null;

  const remaining = Math.max(
    0,
    (reminder.snoozeCountRemaining ?? 2) - 1
  );

  return updateReminder(reminderId, {
    snoozeCountRemaining: remaining,
  });
}

export async function getDoseLogs(): Promise<DoseLog[]> {
  return [...doseLogs];
}

// ---------------------------------------------------------------------------
// 4. Computed Schedule Items
// ---------------------------------------------------------------------------

export function computeScheduleItems(): ScheduleItem[] {
  const today = getLocalDateKey();

  return medications.map((med) => {
    const reminder = reminders.find(
      (item) => item.medicationId === med.id
    );

    const todayLog = doseLogs.find(
      (log) =>
        log.medicationId === med.id &&
        isLogOnDate(log.takenAt, today)
    );

    const time = reminder?.time || '08:00 AM';
    const period = getTimeOfDayGroup(time);
    const reminderStartDate = reminder?.startDate || today;
    const isFuture = reminderStartDate > today;

    let status:
      | 'TAKEN'
      | 'DUE_SOON'
      | 'MISSED'
      | 'SKIPPED'
      | 'UPCOMING' = isFuture ? 'UPCOMING' : 'DUE_SOON';

    if (todayLog) {
      if (todayLog.status === 'taken') {
        status = 'TAKEN';
      } else if (todayLog.status === 'missed') {
        status = 'MISSED';
      } else if (todayLog.status === 'skipped') {
        status = 'SKIPPED';
      }
    }

    const nextTime =
      status === 'TAKEN'
        ? `Next: Tomorrow, ${time}`
        : isFuture
          ? `Starts: ${reminderStartDate}, ${time}`
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
      iconType: med.iconType || 'pill',
      period,
      note: reminder?.note || '',
      snoozeEnabled: reminder?.snoozeEnabled ?? true,
      startDate: reminder?.startDate || today,
      repeat: reminder?.repeat || 'Every Day',
    };
  });
}

// ---------------------------------------------------------------------------
// 5. Existing Adherence Calculation
// Chart, streak and range filtering still require a separate update.
// ---------------------------------------------------------------------------

export function computeAdherenceStats(
  range: '7d' | '30d'
): PeriodData {
  let takenCount = 0;
  let missedCount = 0;
  let lateCount = 0;

  doseLogs.forEach((log) => {
    if (log.status === 'taken') {
      takenCount++;
    } else if (log.status === 'missed') {
      missedCount++;
    } else if (log.status === 'skipped') {
      lateCount++;
    }
  });

  const totalDoses = takenCount + missedCount + lateCount;

  const overallPercentage =
    totalDoses > 0
      ? Math.round((takenCount / totalDoses) * 100)
      : 100;

  const takenFill =
    totalDoses > 0
      ? Math.round((takenCount / totalDoses) * 100)
      : 100;

  const missedFill =
    totalDoses > 0
      ? Math.round((missedCount / totalDoses) * 100)
      : 0;

  const lateFill =
    totalDoses > 0
      ? Math.round((lateCount / totalDoses) * 100)
      : 0;

  // Existing demo values; not yet calculated from dated logs.
  const streakDays = range === '7d' ? 5 : 12;

  const streakMessage =
    overallPercentage >= 80
      ? range === '7d'
        ? "You're on track. Keep it up!"
        : 'Outstanding consistency this month!'
      : 'Keep taking your doses to build your streak!';

  const weeklyTrend = [
    { day: 'M', height: 50, color: '#DCF5E9' },
    { day: 'T', height: 72, color: '#DCF5E9' },
    { day: 'W', height: 38, color: '#FEE2E2' },
    { day: 'T', height: 95, color: '#2BB673', isCurrent: true },
    { day: 'F', height: 62, color: '#DCF5E9' },
    { day: 'S', height: 74, color: '#DCF5E9' },
    { day: 'S', height: 86, color: '#DCF5E9' },
  ];

  const medicationBreakdown = medications.map((med) => {
    const medLogs = doseLogs.filter(
      (log) => log.medicationId === med.id
    );

    const medTaken = medLogs.filter(
      (log) => log.status === 'taken'
    ).length;

    const medTotal = medLogs.length;

    const percentage =
      medTotal > 0
        ? Math.round((medTaken / medTotal) * 100)
        : 100;

    const reminder = reminders.find(
      (item) => item.medicationId === med.id
    );

    const periodGroup = reminder
      ? getTimeOfDayGroup(reminder.time)
      : 'MORNING';

    const periodName =
      periodGroup.charAt(0) +
      periodGroup.slice(1).toLowerCase();

    const isGood = percentage >= 80;

    return {
      id: med.id,
      name: med.name,
      dosage: med.dose,
      period: periodName,
      percentage,
      color: isGood ? '#2BB673' : '#EF4444',
      bgColor: isGood ? '#E6F4EE' : '#FEE2E2',
      trackColor: isGood ? '#E6F4EE' : '#FEE2E2',
    };
  });

  return {
    overallPercentage,
    takenCount,
    missedCount,
    lateCount,
    takenFill,
    missedFill,
    lateFill,
    streakDays,
    streakMessage,
    weeklyTrend,
    medications: medicationBreakdown,
  };
}

// ---------------------------------------------------------------------------
// 6. Reactive Store Hook
// ---------------------------------------------------------------------------

export function useMedicareStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToMedicareStore(() => {
      setTick((previous) => previous + 1);
    });

    return unsubscribe;
  }, []);

  const schedule = computeScheduleItems();

  return {
    medications: [...medications],
    reminders: [...reminders],
    doseLogs: [...doseLogs],
    schedule,
    computeAdherenceStats,
  };
}