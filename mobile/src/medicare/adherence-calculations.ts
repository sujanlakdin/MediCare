import type { Medication, Reminder, DoseLog, PeriodData } from './types';

export type AdherenceStats = PeriodData & {
  totalLogs: number;
  skippedCount: number;
  skippedFill: number;
  medicationLogCounts: Record<string, number>;
};

function dayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function shiftDay(date: Date, offset: number): Date {
  const shifted = new Date(date);
  shifted.setHours(0, 0, 0, 0);
  shifted.setDate(shifted.getDate() + offset);
  return shifted;
}

/**
 * Recorded-outcome adherence, not expected-schedule adherence.
 * Unlogged doses are unknown and are not silently counted as taken or missed.
 */
export function calculateAdherence(
  medications: Medication[],
  reminders: Reminder[],
  doseLogs: DoseLog[],
  range: '7d' | '30d',
  now: Date = new Date()
): AdherenceStats {
  const days = range === '7d' ? 7 : 30;
  const firstDay = shiftDay(now, -(days - 1));
  const knownMedicationIds = new Set(medications.map((med) => med.id));
  const logs = doseLogs.filter((log) => {
    const timestamp = new Date(log.takenAt).getTime();
    return knownMedicationIds.has(log.medicationId) &&
      ['taken', 'missed', 'skipped'].includes(log.status) &&
      Number.isFinite(timestamp) &&
      timestamp >= firstDay.getTime() &&
      timestamp <= now.getTime();
  });

  const takenCount = logs.filter((log) => log.status === 'taken').length;
  const missedCount = logs.filter((log) => log.status === 'missed').length;
  const skippedCount = logs.filter((log) => log.status === 'skipped').length;
  const totalLogs = logs.length;
  const percent = (count: number, total: number) =>
    total ? Math.round(count / total * 100) : 0;

  const logsByDay = new Map<string, DoseLog[]>();
  for (const log of logs) {
    const key = dayKey(new Date(log.takenAt));
    const dayLogs = logsByDay.get(key) || [];
    dayLogs.push(log);
    logsByDay.set(key, dayLogs);
  }

  // Today's lack of records does not end yesterday's streak.
  // A recorded skipped/missed outcome today does end it.
  let cursor = logsByDay.has(dayKey(now)) ? shiftDay(now, 0) : shiftDay(now, -1);
  let streakDays = 0;
  while (cursor >= firstDay) {
    const dayLogs = logsByDay.get(dayKey(cursor));
    if (!dayLogs?.length || dayLogs.some((log) => log.status !== 'taken')) break;
    streakDays++;
    cursor = shiftDay(cursor, -1);
  }

  const weeklyTrend = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDay(now, index - 6);
    const dayLogs = logsByDay.get(dayKey(date)) || [];
    const taken = dayLogs.filter((log) => log.status === 'taken').length;
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      height: percent(taken, dayLogs.length),
      color: dayLogs.length === 0
        ? '#E2E8F0'
        : taken === dayLogs.length ? '#2BB673' : '#EF4444',
      isCurrent: dayKey(date) === dayKey(now),
    };
  });

  const medicationLogCounts: Record<string, number> = {};
  const medicationBreakdown = medications.map((med) => {
    const medLogs = logs.filter((log) => log.medicationId === med.id);
    medicationLogCounts[med.id] = medLogs.length;
    const percentage = percent(
      medLogs.filter((log) => log.status === 'taken').length,
      medLogs.length
    );
    const reminder = reminders.find((item) => item.medicationId === med.id);
    const match = reminder?.time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    let hour = match ? Number(match[1]) : 8;
    if (match?.[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (match?.[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0;
    const period = hour >= 4 && hour < 12
      ? 'Morning' : hour >= 12 && hour < 17 ? 'Afternoon' : 'Evening';
    const color = !medLogs.length ? '#64748B'
      : percentage >= 80 ? '#2BB673' : '#EF4444';
    const bgColor = !medLogs.length ? '#F1F5F9'
      : percentage >= 80 ? '#E6F4EE' : '#FEE2E2';
    return {
      id: med.id,
      name: med.name,
      dosage: med.dose,
      period,
      percentage,
      color,
      bgColor,
      trackColor: bgColor,
    };
  });

  return {
    overallPercentage: percent(takenCount, totalLogs),
    takenCount,
    missedCount,
    skippedCount,
    totalLogs,
    takenFill: percent(takenCount, totalLogs),
    missedFill: percent(missedCount, totalLogs),
    skippedFill: percent(skippedCount, totalLogs),
    // Preserve existing exports for callers using PeriodData.
    lateCount: 0,
    lateFill: 0,
    streakDays,
    streakMessage: streakDays
      ? 'Consecutive days with all recorded doses taken.'
      : 'Log your doses to start a recorded-dose streak.',
    weeklyTrend,
    medications: medicationBreakdown,
    medicationLogCounts,
  };
}
