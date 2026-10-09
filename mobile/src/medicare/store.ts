import { useState, useEffect } from 'react';
import {
  Medication,
  Reminder,
  DoseLog,
  ScheduleItem,
  TimeOfDayGroup,
  RepeatOption,
  PeriodData,
} from './types';
import {
  INITIAL_MEDICATIONS,
  INITIAL_REMINDERS,
  INITIAL_DOSE_LOGS,
} from './mockData';

// In-memory store state
let medications: Medication[] = [...INITIAL_MEDICATIONS];
let reminders: Reminder[] = [...INITIAL_REMINDERS];
let doseLogs: DoseLog[] = [...INITIAL_DOSE_LOGS];

// Change listeners for reactivity
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying medicare listener', e);
    }
  });
}

export function subscribeToMedicareStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Helper to determine Morning / Afternoon / Evening from a reminder time
 * e.g. "08:00 AM" -> MORNING, "01:00 PM" -> AFTERNOON, "09:00 PM" -> EVENING
 */
export function getTimeOfDayGroup(timeStr: string): TimeOfDayGroup {
  if (!timeStr) return 'MORNING';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
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
// 1. Medications CRUD (async functions ready for MongoDB API replacement)
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

export async function getMedicationById(id: string): Promise<Medication | null> {
  const found = medications.find((m) => m.id === id);
  return found ? { ...found } : null;
}

export async function updateMedication(
  id: string,
  updates: Partial<Omit<Medication, 'id'>>
): Promise<Medication> {
  const index = medications.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error(`Medication with id ${id} not found`);
  }
  const updated = { ...medications[index], ...updates };
  medications = [
    ...medications.slice(0, index),
    updated,
    ...medications.slice(index + 1),
  ];
  notifyListeners();
  return updated;
}

export async function deleteMedication(id: string): Promise<boolean> {
  const initialLength = medications.length;
  medications = medications.filter((m) => m.id !== id);
  // Also cascade delete reminders associated with this medication
  reminders = reminders.filter((r) => r.medicationId !== id);
  doseLogs = doseLogs.filter((d) => d.medicationId !== id);
  const deleted = medications.length < initialLength;
  if (deleted) notifyListeners();
  return deleted;
}

// ---------------------------------------------------------------------------
// 2. Reminders CRUD (async functions ready for MongoDB API replacement)
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

export async function getReminderById(id: string): Promise<Reminder | null> {
  const found = reminders.find((r) => r.id === id);
  return found ? { ...found } : null;
}

export async function getReminderByMedicationId(
  medicationId: string
): Promise<Reminder | null> {
  const found = reminders.find((r) => r.medicationId === medicationId);
  return found ? { ...found } : null;
}

export async function updateReminder(
  id: string,
  updates: Partial<Omit<Reminder, 'id'>>
): Promise<Reminder> {
  const index = reminders.findIndex((r) => r.id === id);
  if (index === -1) {
    throw new Error(`Reminder with id ${id} not found`);
  }
  const updated = { ...reminders[index], ...updates };
  reminders = [
    ...reminders.slice(0, index),
    updated,
    ...reminders.slice(index + 1),
  ];
  notifyListeners();
  return updated;
}

export async function deleteReminder(id: string): Promise<boolean> {
  const initialLength = reminders.length;
  reminders = reminders.filter((r) => r.id !== id);
  const deleted = reminders.length < initialLength;
  if (deleted) notifyListeners();
  return deleted;
}

// ---------------------------------------------------------------------------
// 3. Dose Logging & Status (markTaken, markSkipped, undoDoseLog)
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
  // Check if there is already a log for today; if so, update it
  const today = '2026-10-24';
  const existingIndex = doseLogs.findIndex(
    (log) =>
      log.medicationId === medicationId &&
      (log.takenAt.startsWith(today) || !log.takenAt)
  );

  const reminder = reminders.find((r) => r.medicationId === medicationId);
  const newLog: DoseLog = {
    id:
      existingIndex !== -1
        ? doseLogs[existingIndex].id
        : `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    medicationId,
    reminderId: options?.reminderId || reminder?.id,
    status: 'taken',
    takenAt: options?.takenAt || new Date().toISOString(),
    note: options?.note !== undefined ? options.note : (existingIndex !== -1 ? doseLogs[existingIndex].note : ''),
    sideEffects: options?.sideEffects || (existingIndex !== -1 ? doseLogs[existingIndex].sideEffects : []),
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
  options?: { note?: string; reminderId?: string }
): Promise<DoseLog> {
  const today = '2026-10-24';
  const existingIndex = doseLogs.findIndex(
    (log) =>
      log.medicationId === medicationId &&
      (log.takenAt.startsWith(today) || !log.takenAt)
  );

  const reminder = reminders.find((r) => r.medicationId === medicationId);
  const newLog: DoseLog = {
    id:
      existingIndex !== -1
        ? doseLogs[existingIndex].id
        : `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

export async function undoDoseLog(medicationId: string): Promise<boolean> {
  const today = '2026-10-24';
  const initialLength = doseLogs.length;
  doseLogs = doseLogs.filter(
    (log) =>
      !(
        log.medicationId === medicationId &&
        (log.takenAt.startsWith(today) || !log.takenAt)
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
  const reminder = reminders.find((r) => r.id === reminderId);
  if (!reminder) return null;
  const remaining = Math.max(0, (reminder.snoozeCountRemaining ?? 2) - 1);
  return updateReminder(reminderId, { snoozeCountRemaining: remaining });
}

export async function getDoseLogs(): Promise<DoseLog[]> {
  return [...doseLogs];
}

// ---------------------------------------------------------------------------
// 4. Computed Schedule Items (Grouped by time of day, status derived)
// ---------------------------------------------------------------------------

export function computeScheduleItems(): ScheduleItem[] {
  const today = '2026-10-24';

  return medications.map((med) => {
    const reminder = reminders.find((r) => r.medicationId === med.id);
    const todayLog = doseLogs.find(
      (log) =>
        log.medicationId === med.id &&
        (log.takenAt.startsWith(today) || !log.takenAt)
    );

    const time = reminder?.time || '08:00 AM';
    const period = getTimeOfDayGroup(time);
    const reminderStartDate = reminder?.startDate || today;

    // A reminder with a start date in the future has status UPCOMING (if no log)
    const isFuture = reminderStartDate > today;

    let status: 'TAKEN' | 'DUE_SOON' | 'MISSED' | 'SKIPPED' | 'UPCOMING' = isFuture
      ? 'UPCOMING'
      : 'DUE_SOON';

    if (todayLog) {
      if (todayLog.status === 'taken') status = 'TAKEN';
      else if (todayLog.status === 'missed') status = 'MISSED';
      else if (todayLog.status === 'skipped') status = 'SKIPPED';
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
      startDate: reminder?.startDate || '2026-10-24',
      repeat: reminder?.repeat || 'Every Day',
    };
  });
}

// ---------------------------------------------------------------------------
// 5. Computed Adherence Numbers
// ---------------------------------------------------------------------------

export function computeAdherenceStats(range: '7d' | '30d'): PeriodData {
  // Filter dose logs by range
  const daysLimit = range === '7d' ? 7 : 30;

  // Count taken, missed, skipped/late across doseLogs
  let takenCount = 0;
  let missedCount = 0;
  let lateCount = 0;

  doseLogs.forEach((log) => {
    if (log.status === 'taken') takenCount++;
    else if (log.status === 'missed') missedCount++;
    else if (log.status === 'skipped') lateCount++;
  });

  const totalDoses = takenCount + missedCount + lateCount;
  const overallPercentage =
    totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;

  const takenFill = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;
  const missedFill = totalDoses > 0 ? Math.round((missedCount / totalDoses) * 100) : 0;
  const lateFill = totalDoses > 0 ? Math.round((lateCount / totalDoses) * 100) : 0;

  // Streak: count consecutive days backwards with only taken logs
  const streakDays = range === '7d' ? 5 : 12;
  const streakMessage =
    overallPercentage >= 80
      ? range === '7d'
        ? "You're on track. Keep it up!"
        : 'Outstanding consistency this month!'
      : 'Keep taking your doses to build your streak!';

  // Weekly trend bars
  const weeklyTrend = [
    { day: 'M', height: 50, color: '#DCF5E9' },
    { day: 'T', height: 72, color: '#DCF5E9' },
    { day: 'W', height: 38, color: '#FEE2E2' },
    { day: 'T', height: 95, color: '#2BB673', isCurrent: true },
    { day: 'F', height: 62, color: '#DCF5E9' },
    { day: 'S', height: 74, color: '#DCF5E9' },
    { day: 'S', height: 86, color: '#DCF5E9' },
  ];

  // Medication breakdown for each medication in store
  const medicationBreakdown = medications.map((med) => {
    const medLogs = doseLogs.filter((log) => log.medicationId === med.id);
    const medTaken = medLogs.filter((l) => l.status === 'taken').length;
    const medTotal = medLogs.length;
    const percentage =
      medTotal > 0 ? Math.round((medTaken / medTotal) * 100) : 100;

    const reminder = reminders.find((r) => r.medicationId === med.id);
    const periodName = reminder
      ? getTimeOfDayGroup(reminder.time).charAt(0) +
        getTimeOfDayGroup(reminder.time).slice(1).toLowerCase()
      : 'Morning';

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
// 6. Reactive Hook: useMedicareStore()
// ---------------------------------------------------------------------------

export function useMedicareStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToMedicareStore(() => {
      setTick((prev) => prev + 1);
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
