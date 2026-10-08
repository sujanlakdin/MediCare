import { Medication, Reminder, DoseLog } from './types';

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dose: '10mg',
    instructions: 'With food',
    timeOfDayGroup: 'MORNING',
    iconType: 'pill',
  },
  {
    id: '2',
    name: 'Vitamin D3',
    dose: '2000 IU',
    instructions: 'Anytime',
    timeOfDayGroup: 'MORNING',
    iconType: 'pill',
  },
  {
    id: '3',
    name: 'Metformin',
    dose: '500mg',
    instructions: 'With lunch',
    timeOfDayGroup: 'AFTERNOON',
    iconType: 'water',
  },
  {
    id: '4',
    name: 'Atorvastatin',
    dose: '20mg',
    instructions: 'Before bed',
    timeOfDayGroup: 'EVENING',
    iconType: 'pill',
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    medicationId: '1',
    time: '08:00 AM',
    repeat: 'Every Day',
    startDate: '2026-10-24',
    snoozeEnabled: true,
    note: 'Take 1 tablet by mouth with a full glass of water. Best taken on an empty stomach.',
    notificationSound: 'Morning Dew',
    snoozeCountRemaining: 2,
  },
  {
    id: 'rem-2',
    medicationId: '2',
    time: '08:00 AM',
    repeat: 'Every Day',
    startDate: '2026-10-24',
    snoozeEnabled: true,
    note: 'Take with breakfast or meal.',
    notificationSound: 'Gentle Chime',
    snoozeCountRemaining: 2,
  },
  {
    id: 'rem-3',
    medicationId: '3',
    time: '01:00 PM',
    repeat: 'Every Day',
    startDate: '2026-10-24',
    snoozeEnabled: true,
    note: 'Take with lunch.',
    notificationSound: 'Morning Dew',
    snoozeCountRemaining: 2,
  },
  {
    id: 'rem-4',
    medicationId: '4',
    time: '09:00 PM',
    repeat: 'Every Day',
    startDate: '2026-10-24',
    snoozeEnabled: true,
    note: 'Before bed.',
    notificationSound: 'Classic Bell',
    snoozeCountRemaining: 2,
  },
];

// Seed logs: today's logs + historical logs over the past week/month
export const INITIAL_DOSE_LOGS: DoseLog[] = [
  // Today's logs (2026-10-24)
  {
    id: 'log-today-1',
    medicationId: '1',
    reminderId: 'rem-1',
    status: 'taken',
    takenAt: '2026-10-24T08:12:00.000Z',
    note: '',
    sideEffects: ['Nausea'],
  },
  {
    id: 'log-today-2',
    medicationId: '2',
    reminderId: 'rem-2',
    status: 'taken',
    takenAt: '2026-10-24T08:05:00.000Z',
    note: '',
    sideEffects: [],
  },
  // Metformin has no log yet today -> DUE_SOON
  {
    id: 'log-today-4',
    medicationId: '4',
    reminderId: 'rem-4',
    status: 'missed',
    takenAt: '2026-10-24T21:00:00.000Z',
    note: '',
    sideEffects: [],
  },

  // Past 6 days of logs for Lisinopril (100% taken in 7d)
  { id: 'log-p1-1', medicationId: '1', reminderId: 'rem-1', status: 'taken', takenAt: '2026-10-23T08:00:00.000Z' },
  { id: 'log-p2-1', medicationId: '1', reminderId: 'rem-1', status: 'taken', takenAt: '2026-10-22T08:10:00.000Z' },
  { id: 'log-p3-1', medicationId: '1', reminderId: 'rem-1', status: 'taken', takenAt: '2026-10-21T08:00:00.000Z' },
  { id: 'log-p4-1', medicationId: '1', reminderId: 'rem-1', status: 'taken', takenAt: '2026-10-20T08:05:00.000Z' },
  { id: 'log-p5-1', medicationId: '1', reminderId: 'rem-1', status: 'taken', takenAt: '2026-10-19T08:00:00.000Z' },
  { id: 'log-p6-1', medicationId: '1', reminderId: 'rem-1', status: 'taken', takenAt: '2026-10-18T08:00:00.000Z' },

  // Past 6 days for Vitamin D3
  { id: 'log-p1-2', medicationId: '2', reminderId: 'rem-2', status: 'taken', takenAt: '2026-10-23T08:05:00.000Z' },
  { id: 'log-p2-2', medicationId: '2', reminderId: 'rem-2', status: 'taken', takenAt: '2026-10-22T08:15:00.000Z' },
  { id: 'log-p3-2', medicationId: '2', reminderId: 'rem-2', status: 'taken', takenAt: '2026-10-21T08:00:00.000Z' },
  { id: 'log-p4-2', medicationId: '2', reminderId: 'rem-2', status: 'taken', takenAt: '2026-10-20T08:00:00.000Z' },
  { id: 'log-p5-2', medicationId: '2', reminderId: 'rem-2', status: 'taken', takenAt: '2026-10-19T08:05:00.000Z' },
  { id: 'log-p6-2', medicationId: '2', reminderId: 'rem-2', status: 'taken', takenAt: '2026-10-18T08:00:00.000Z' },

  // Past days for Metformin (some taken, some missed)
  { id: 'log-p1-3', medicationId: '3', reminderId: 'rem-3', status: 'taken', takenAt: '2026-10-23T13:00:00.000Z' },
  { id: 'log-p2-3', medicationId: '3', reminderId: 'rem-3', status: 'missed', takenAt: '2026-10-22T13:00:00.000Z' },
  { id: 'log-p3-3', medicationId: '3', reminderId: 'rem-3', status: 'taken', takenAt: '2026-10-21T13:30:00.000Z' },
  { id: 'log-p4-3', medicationId: '3', reminderId: 'rem-3', status: 'taken', takenAt: '2026-10-20T13:00:00.000Z' },
  { id: 'log-p5-3', medicationId: '3', reminderId: 'rem-3', status: 'missed', takenAt: '2026-10-19T13:00:00.000Z' },
  { id: 'log-p6-3', medicationId: '3', reminderId: 'rem-3', status: 'taken', takenAt: '2026-10-18T13:10:00.000Z' },

  // Past days for Atorvastatin
  { id: 'log-p1-4', medicationId: '4', reminderId: 'rem-4', status: 'taken', takenAt: '2026-10-23T21:00:00.000Z' },
  { id: 'log-p2-4', medicationId: '4', reminderId: 'rem-4', status: 'taken', takenAt: '2026-10-22T21:05:00.000Z' },
  { id: 'log-p3-4', medicationId: '4', reminderId: 'rem-4', status: 'missed', takenAt: '2026-10-21T21:00:00.000Z' },
  { id: 'log-p4-4', medicationId: '4', reminderId: 'rem-4', status: 'taken', takenAt: '2026-10-20T21:00:00.000Z' },
  { id: 'log-p5-4', medicationId: '4', reminderId: 'rem-4', status: 'taken', takenAt: '2026-10-19T21:00:00.000Z' },
  { id: 'log-p6-4', medicationId: '4', reminderId: 'rem-4', status: 'taken', takenAt: '2026-10-18T21:00:00.000Z' },
];
