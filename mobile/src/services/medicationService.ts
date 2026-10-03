import { useSyncExternalStore } from 'react';

/**
 * Type Medication Definition
 * 
 * TODO: connect real API / database
 * Future database schema (e.g. PostgreSQL / Supabase / MongoDB):
 * Table/Collection: medications
 * Fields:
 * - id: uuid / serial primary key
 * - user_id: uuid (foreign key referencing auth.users)
 * - name: varchar(255) not null
 * - purpose: varchar(255)
 * - form: varchar(50) check (form in ('Tablet', 'Capsule', 'Syrup'))
 * - qty: integer not null default 1
 * - times: text[] or jsonb array of "HH:MM" (24h) strings
 * - repeat: varchar(50) check (repeat in ('Daily', 'Weekly', 'Monthly'))
 * - stock: integer not null default 0
 * - created_at: timestamptz default now()
 */
export interface Medication {
  id: number;
  name: string;
  purpose: string;
  form: 'Tablet' | 'Capsule' | 'Syrup';
  qty: number;
  times: string[]; // "HH:MM" 24h format, e.g. ["08:00", "18:00"]
  repeat: 'Daily' | 'Weekly' | 'Monthly';
  stock: number;
  taken: Record<string, boolean>; // e.g. { '08:00': true }
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
    times: ['08:00'],
    repeat: 'Daily',
    stock: 24,
    taken: { '08:00': true },
  },
  {
    id: 2,
    name: 'Atorvastatin 20mg',
    purpose: 'Cholesterol',
    form: 'Tablet',
    qty: 1,
    times: ['08:00'],
    repeat: 'Daily',
    stock: 18,
    taken: { '08:00': true },
  },
  {
    id: 3,
    name: 'Metformin 500mg',
    purpose: 'Diabetes management',
    form: 'Tablet',
    qty: 1,
    times: ['12:30', '18:00'],
    repeat: 'Daily',
    stock: 6,
    taken: {},
  },
  {
    id: 4,
    name: 'Amlodipine 5mg',
    purpose: 'Blood pressure',
    form: 'Tablet',
    qty: 1,
    times: ['21:00'],
    repeat: 'Daily',
    stock: 30,
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
 * Ensures Patient Dashboard and Medication List stay perfectly in sync.
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

export function getFlattenedDoses(meds: Medication[]): DoseScheduleItem[] {
  const now = getCurrentTime24();
  const doses: DoseScheduleItem[] = [];

  for (const med of meds) {
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

export async function addMedication(
  item: Omit<Medication, 'id' | 'taken'> & { taken?: Record<string, boolean> }
): Promise<Medication> {
  await delay();
  const newMed: Medication = {
    ...item,
    id: ++nextMedicationId,
    taken: item.taken || {},
    times: [...new Set(item.times)].sort(),
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

  const updated: Medication = {
    ...existing,
    ...item,
    id,
    times: updatedTimes,
    taken: updatedTaken,
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
  await delay(120);
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
