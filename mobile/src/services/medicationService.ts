import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/**
 * Type Medication Definition
 * Connected to MongoDB backend at http://localhost:5000/api/medications
 */
export interface Medication {
  id: number | string;
  _id?: string;
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
    id: '66f000000000000000000001',
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
    image: '',
  },
  {
    id: '66f000000000000000000002',
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
    image: '',
  },
  {
    id: '66f00000000000000000003',
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
    image: '',
  },
  {
    id: '66f00000000000000000004',
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
    image: '',
  },
];

// Backend API endpoint configuration
const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

function normalizeMedication(raw: any): Medication {
  const id = raw.id || raw._id || String(Date.now());
  let takenObj: Record<string, boolean> = {};
  if (raw.taken) {
    if (raw.taken instanceof Map) {
      takenObj = Object.fromEntries(raw.taken);
    } else if (typeof raw.taken === 'object') {
      takenObj = { ...raw.taken };
    }
  }

  return {
    id,
    _id: raw._id ? String(raw._id) : String(id),
    name: raw.name || '',
    purpose: raw.purpose || '',
    form: raw.form || 'Tablet',
    qty: Math.max(1, Number(raw.qty) || 1),
    meal: raw.meal || 'After food',
    times: Array.isArray(raw.times) && raw.times.length > 0 ? raw.times : ['08:00'],
    days: Array.isArray(raw.days) && raw.days.length > 0 ? raw.days : [0, 1, 2, 3, 4, 5, 6],
    repeat: raw.repeat || 'Daily',
    start: raw.start || '',
    end: raw.end || '',
    stock: Math.max(0, Number(raw.stock) || 0),
    alert: raw.alert !== undefined ? Boolean(raw.alert) : true,
    taken: takenObj,
    image: raw.image || undefined,
  };
}

// Module-level in-memory reactive store
let medicationsStore: Medication[] = [...INITIAL_MEDICATIONS];
let nextMedicationId = 100;
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

/**
 * Fetch all medications from MongoDB backend API
 */
export async function listMedications(): Promise<Medication[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/medications`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        medicationsStore = json.data.map(normalizeMedication);
        emitChange();
        return medicationsStore;
      }
    }
  } catch (e) {
    // Graceful fallback to local reactive store
  }
  return [...medicationsStore];
}

/**
 * Get medication details by id from MongoDB API
 */
export async function getMedication(id: number | string): Promise<Medication | null> {
  const idStr = String(id);
  try {
    const res = await fetch(`${API_BASE_URL}/api/medications/${idStr}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return normalizeMedication(json.data);
      }
    }
  } catch (e) {
    // Fallback to local store
  }
  const found = medicationsStore.find((m) => String(m.id) === idStr || String(m._id) === idStr);
  return found ? { ...found } : null;
}

/**
 * Add medication to MongoDB via backend API
 */
export async function addMedication(
  item: Omit<Medication, 'id' | 'taken'> & { taken?: Record<string, boolean> }
): Promise<Medication> {
  const payload = {
    ...item,
    meal: item.meal || 'After food',
    start: item.start || '',
    end: item.end || '',
    alert: item.alert !== undefined ? item.alert : true,
    taken: item.taken || {},
    times: [...new Set(item.times)].sort(),
    days: [...new Set(item.days || [0, 1, 2, 3, 4, 5, 6])].sort(),
    image: item.image || '',
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/medications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        const saved = normalizeMedication(json.data);
        medicationsStore = [saved, ...medicationsStore.filter((m) => String(m.id) !== String(saved.id))];
        emitChange();
        return saved;
      }
    }
  } catch (e) {
    // Fallback to local store
  }

  const fallbackId = String(++nextMedicationId);
  const newMed: Medication = {
    ...payload,
    id: fallbackId,
    _id: fallbackId,
  };
  medicationsStore = [newMed, ...medicationsStore];
  emitChange();
  return newMed;
}

/**
 * Update medication in MongoDB via backend API
 */
export async function updateMedication(
  id: number | string,
  item: Partial<Medication>
): Promise<Medication> {
  const idStr = String(id);
  const index = medicationsStore.findIndex(
    (m) => String(m.id) === idStr || String(m._id) === idStr
  );

  const existing = index !== -1 ? medicationsStore[index] : null;
  const updatedTimes = item.times
    ? [...new Set(item.times)].sort()
    : existing ? existing.times : ['08:00'];

  const updatedTaken: Record<string, boolean> = {};
  for (const t of updatedTimes) {
    if (item.taken && item.taken[t] !== undefined) {
      updatedTaken[t] = item.taken[t];
    } else if (existing && existing.taken && existing.taken[t]) {
      updatedTaken[t] = true;
    }
  }

  const updatedImage = item.image !== undefined ? item.image : (existing ? existing.image : '');

  const payload: Partial<Medication> = {
    ...item,
    times: updatedTimes,
    taken: updatedTaken,
    image: updatedImage,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/medications/${idStr}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        const saved = normalizeMedication(json.data);
        if (index !== -1) {
          medicationsStore = [
            ...medicationsStore.slice(0, index),
            saved,
            ...medicationsStore.slice(index + 1),
          ];
        } else {
          medicationsStore = [saved, ...medicationsStore];
        }
        emitChange();
        return saved;
      }
    }
  } catch (e) {
    // Fallback to local store
  }

  if (!existing) {
    throw new Error(`Medication with id ${id} not found`);
  }

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

/**
 * Delete medication from MongoDB via backend API
 */
export async function deleteMedication(id: number | string): Promise<boolean> {
  const idStr = String(id);
  try {
    await fetch(`${API_BASE_URL}/api/medications/${idStr}`, {
      method: 'DELETE',
    });
  } catch (e) {
    // Fallback to local store
  }

  medicationsStore = medicationsStore.filter(
    (m) => String(m.id) !== idStr && String(m._id) !== idStr
  );
  emitChange();
  return true;
}

/**
 * Mark dose as taken in MongoDB via backend API
 */
export async function markDoseTaken(id: number | string, time: string): Promise<boolean> {
  const idStr = String(id);
  try {
    fetch(`${API_BASE_URL}/api/medications/${idStr}/taken`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ time }),
    }).catch(() => {});
  } catch (e) {}

  const index = medicationsStore.findIndex(
    (m) => String(m.id) === idStr || String(m._id) === idStr
  );
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

/**
 * Toggle refill alert in MongoDB via backend API
 */
export async function toggleRefillAlert(id: number | string): Promise<boolean> {
  const idStr = String(id);
  const index = medicationsStore.findIndex(
    (m) => String(m.id) === idStr || String(m._id) === idStr
  );
  if (index === -1) return false;

  const current = medicationsStore[index];
  const nextAlert = !current.alert;

  try {
    fetch(`${API_BASE_URL}/api/medications/${idStr}/alert`, {
      method: 'PATCH',
    }).catch(() => {});
  } catch (e) {}

  const updated: Medication = {
    ...current,
    alert: nextAlert,
  };

  medicationsStore = [
    ...medicationsStore.slice(0, index),
    updated,
    ...medicationsStore.slice(index + 1),
  ];
  emitChange();
  return updated.alert;
}

// Automatically fetch from backend API on launch to hydrate reactive store
listMedications().catch(() => {});
