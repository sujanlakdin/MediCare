import { useSyncExternalStore } from 'react';

/**
 * Type Medication Definition
 * 
 * TODO: connect real API / database
 * Future table: id, user_id, name, purpose, form, qty, meal, times, days, repeat, start_date, end_date, stock, alert, created_at
 */
export interface Medication {
  id: number;
  name: string;
  purpose: string;
  form: 'Tablet' | 'Capsule' | 'Syrup';
  qty: number;
  meal: string; // 'Before food' | 'After food' | 'With meals' | 'Anytime'
  times: string[]; // "HH:MM" 24h format, e.g. ["08:00", "18:00"]
  days: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  repeat: string; // 'Daily' | 'Weekly' | 'Monthly'
  start: string; // "YYYY-MM-DD"
  end: string; // "YYYY-MM-DD"
  stock: number;
  alert: boolean;
  taken: Record<string, boolean>; // e.g. { '08:00': true }
  image?: string;
}

export interface DoseScheduleItem {
  medication: Medication;
  time: string;
  isTaken: boolean;
  isDue: boolean;
  period: 'Morning' | 'Afternoon' | 'Evening';
}

// Initial Seed Data matching prompt specifications
const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 1,
    name: 'Lisinopril 10mg',
    purpose: 'Blood pressure',
    form: 'Tablet',
    qty: 1,
    meal: 'After food',
    times: ['08:00'],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: 'Daily',
    start: '',
    end: '',
    stock: 24,
    alert: true,
    taken: { '08:00': true },
  },
  {
    id: 2,
    name: 'Atorvastatin 20mg',
    purpose: 'Cholesterol',
    form: 'Tablet',
    qty: 1,
    meal: 'After food',
    times: ['08:00'],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: 'Daily',
    start: '',
    end: '',
    stock: 18,
    alert: true,
    taken: { '08:00': true },
  },
  {
    id: 3,
    name: 'Metformin 500mg',
    purpose: 'Diabetes management',
    form: 'Tablet',
    qty: 1,
    meal: 'After food',
    times: ['12:30', '18:00'],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: 'Daily',
    start: '',
    end: '',
    stock: 6,
    alert: true,
    taken: {},
  },
  {
    id: 4,
    name: 'Amlodipine 5mg',
    purpose: 'Blood pressure',
    form: 'Tablet',
    qty: 1,
    meal: 'After food',
    times: ['21:00'],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: 'Daily',
    start: '',
    end: '',
    stock: 30,
    alert: true,
    taken: {},
  },
];

// Module-level in-memory reactive store
let medicationsStore: Medication[] = [...INITIAL_MEDICATIONS];
let nextMedicationId = 10;
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeMedications(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getMedicationsSnapshot(): Medication[] {
  return medicationsStore;
}

/**
 * useMedications Hook
 * Synchronizes with the module-level reactive store via useSyncExternalStore.
 * Ensures Patient Dashboard, Medication List, Detail, and Form stay in sync.
 */
export function useMedications(): Medication[] {
  return useSyncExternalStore(
    subscribeMedications,
    getMedicationsSnapshot,
    getMedicationsSnapshot
  );
}

// Helper time calculation utilities
export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getTimePeriod(time24: string): 'Morning' | 'Afternoon' | 'Evening' {
  if (!time24 || !time24.includes(':')) return 'Morning';
  const h = Number(time24.split(':')[0]);
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export function getCurrentTime24(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDaysSummary(days: number[]): string {
  if (!days || days.length === 0) return 'None';
  if (days.length === 7) return 'Everyday';
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES_SHORT[d])
    .join(', ');
}

/**
 * Get flattened dose list.
 * If weekday is provided (default today: new Date().getDay()),
 * strictly filters to medicines scheduled for that weekday.
 */
export function getFlattenedDoses(
  meds: Medication[],
  weekday = new Date().getDay()
): DoseScheduleItem[] {
  const now = getCurrentTime24();
  const doses: DoseScheduleItem[] = [];

  const scheduledMeds = meds.filter((m) =>
    Array.isArray(m.days) ? m.days.includes(weekday) : true
  );

  for (const med of scheduledMeds) {
    for (const time of med.times) {
      const isTaken = !!med.taken[time];
      const isDue = !isTaken && time <= now;
      doses.push({
        medication: med,
        time,
        isTaken,
        isDue,
        period: getTimePeriod(time),
      });
    }
  }

  return doses.sort((a, b) => a.time.localeCompare(b.time));
}

// Mock async functions with a short delay (TODO: replace with database / API calls)
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listMedications(): Promise<Medication[]> {
  await delay();
  return [...medicationsStore];
}

export async function getMedication(id: number): Promise<Medication | null> {
  await delay(100);
  const found = medicationsStore.find((m) => m.id === id);
  return found ? { ...found } : null;
}

export async function addMedication(
  item: Omit<Medication, 'id' | 'taken'> & { taken?: Record<string, boolean> }
): Promise<Medication> {
  await delay();
  // TODO: in the real database store an image URL after uploading to storage (base64 is demo only)
  const newMed: Medication = {
    ...item,
    meal: item.meal || 'After food',
    start: item.start || '',
    end: item.end || '',
    alert: item.alert !== undefined ? item.alert : true,
    id: ++nextMedicationId,
    taken: item.taken || {},
    times: [...new Set(item.times)].sort(),
    days: [...new Set(item.days || [0, 1, 2, 3, 4, 5, 6])].sort(),
    image: item.image,
  };
  medicationsStore = [...medicationsStore, newMed];
  emitChange();
  return newMed;
}

export async function updateMedication(
  id: number,
  item: Partial<Medication>
): Promise<Medication> {
  await delay();
  const index = medicationsStore.findIndex((m) => m.id === id);
  if (index === -1) {
    throw new Error(`Medication with id ${id} not found`);
  }

  const existing = medicationsStore[index];
  const updatedTimes = item.times ? [...new Set(item.times)].sort() : existing.times;

  // Filter taken flags to keep only those still present in times
  const updatedTaken: Record<string, boolean> = {};
  for (const t of updatedTimes) {
    if (item.taken && item.taken[t] !== undefined) {
      updatedTaken[t] = item.taken[t];
    } else if (existing.taken[t]) {
      updatedTaken[t] = true;
    }
  }

  // TODO: in the real database store an image URL after uploading to storage (base64 is demo only)
  // Ensure image is kept on edit (never drop it unless explicitly changed)
  const updatedImage = item.image !== undefined ? item.image : existing.image;

  const updated: Medication = {
    ...existing,
    ...item,
    id,
    times: updatedTimes,
    taken: updatedTaken,
    image: updatedImage,
  };

  medicationsStore = [
    ...medicationsStore.slice(0, index),
    updated,
    ...medicationsStore.slice(index + 1),
  ];
  emitChange();
  return updated;
}

export async function deleteMedication(id: number): Promise<boolean> {
  await delay();
  medicationsStore = medicationsStore.filter((m) => m.id !== id);
  emitChange();
  return true;
}

export async function markDoseTaken(id: number, time: string): Promise<boolean> {
  await delay(100);
  const index = medicationsStore.findIndex((m) => m.id === id);
  if (index === -1) return false;

  const current = medicationsStore[index];
  const updated: Medication = {
    ...current,
    taken: {
      ...current.taken,
      [time]: true,
    },
  };

  medicationsStore = [
    ...medicationsStore.slice(0, index),
    updated,
    ...medicationsStore.slice(index + 1),
  ];
  emitChange();
  return true;
}

export async function toggleRefillAlert(id: number): Promise<boolean> {
  await delay(80);
  const index = medicationsStore.findIndex((m) => m.id === id);
  if (index === -1) return false;

  const current = medicationsStore[index];
  const updated: Medication = {
    ...current,
    alert: !current.alert,
  };

  medicationsStore = [
    ...medicationsStore.slice(0, index),
    updated,
    ...medicationsStore.slice(index + 1),
  ];
  emitChange();
  return updated.alert;
}
