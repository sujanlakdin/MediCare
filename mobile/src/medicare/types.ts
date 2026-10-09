export type TimeOfDayGroup = 'MORNING' | 'AFTERNOON' | 'EVENING';

export type RepeatOption = 'Every Day' | 'Weekdays' | 'Custom';

export type DoseStatus = 'taken' | 'missed' | 'skipped';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  instructions: string;
  timeOfDayGroup: TimeOfDayGroup;
  iconType?: 'pill' | 'water';
}

export interface Reminder {
  id: string;
  medicationId: string;
  time: string; // e.g. "08:00 AM", "01:00 PM"
  repeat: RepeatOption;
  startDate: string; // e.g. "2026-10-24"
  snoozeEnabled: boolean;
  note: string;
  notificationSound?: string;
  snoozeCountRemaining?: number;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  reminderId?: string;
  status: DoseStatus;
  takenAt: string; // ISO 8601 string
  note?: string;
  sideEffects?: string[];
}

export interface ScheduleItem {
  id: string; // medication id for easy routing
  medicationId: string;
  reminderId: string;
  name: string;
  dosage: string;
  instructions: string;
  status: 'TAKEN' | 'DUE_SOON' | 'MISSED' | 'SKIPPED' | 'UPCOMING';
  time: string;
  nextTime: string;
  iconType: 'pill' | 'water';
  period: TimeOfDayGroup;
  note?: string;
  snoozeEnabled: boolean;
  startDate: string;
  repeat: RepeatOption;
}

export interface DayTrend {
  day: string;
  height: number;
  color: string;
  isCurrent?: boolean;
}

export interface MedicationAdherence {
  id: string;
  name: string;
  dosage: string;
  period: string;
  percentage: number;
  color: string;
  bgColor: string;
  trackColor: string;
}

export interface PeriodData {
  overallPercentage: number;
  takenCount: number;
  missedCount: number;
  lateCount: number;
  takenFill: number;
  missedFill: number;
  lateFill: number;
  streakDays: number;
  streakMessage: string;
  weeklyTrend: DayTrend[];
  medications: MedicationAdherence[];
}
