import { eq } from 'drizzle-orm';
import { create } from 'zustand';
import { db } from '../db';
import { allergies, conditions, medications } from '../db/schema';
import type { Allergy, MedicalCondition, Medication } from '@/types/medical';

interface MedicalState {
  conditions: MedicalCondition[];
  medications: Medication[];
  allergies: Allergy[];
  isLoading: boolean;
  loadAll: () => Promise<void>;
  addCondition: (data: Omit<MedicalCondition, 'id' | 'createdAt'>) => Promise<void>;
  updateCondition: (id: number, data: Partial<MedicalCondition>) => Promise<void>;
  deleteCondition: (id: number) => Promise<void>;
  addMedication: (data: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  updateMedication: (id: number, data: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: number) => Promise<void>;
  addAllergy: (data: Omit<Allergy, 'id' | 'createdAt'>) => Promise<void>;
  updateAllergy: (id: number, data: Partial<Allergy>) => Promise<void>;
  deleteAllergy: (id: number) => Promise<void>;
  getCriticalAllergies: () => Allergy[];
  getTodayMedications: () => Medication[];
}

export const useMedicalStore = create<MedicalState>((set, get) => ({
  conditions: [],
  medications: [],
  allergies: [],
  isLoading: false,

  loadAll: async () => {
    set({ isLoading: true });
    try {
      const [conds, meds, algs] = await Promise.all([
        db.select().from(conditions),
        db.select().from(medications),
        db.select().from(allergies),
      ]);
      set({
        conditions: conds.map((c) => ({
          id: c.id,
          name: c.name,
          status: (c.status as MedicalCondition['status']) ?? 'activa',
          diagnosisYear: c.diagnosisYear ?? undefined,
          notes: c.notes ?? undefined,
          syncedAt: c.syncedAt ?? undefined,
          createdAt: c.createdAt ?? new Date().toISOString(),
        })),
        medications: meds.map((m) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage ?? undefined,
          frequency: m.frequency,
          startDate: m.startDate ?? undefined,
          instructions: m.instructions ?? undefined,
          active: m.active ?? true,
          syncedAt: m.syncedAt ?? undefined,
          createdAt: m.createdAt ?? new Date().toISOString(),
        })),
        allergies: algs.map((a) => ({
          id: a.id,
          name: a.name,
          severity: a.severity as Allergy['severity'],
          reaction: a.reaction ?? undefined,
          syncedAt: a.syncedAt ?? undefined,
          createdAt: a.createdAt ?? new Date().toISOString(),
        })),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addCondition: async (data) => {
    const result = await db.insert(conditions).values({
      name: data.name,
      status: data.status,
      diagnosisYear: data.diagnosisYear,
      notes: data.notes,
    }).returning();
    const newItem: MedicalCondition = {
      ...data,
      id: result[0].id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ conditions: [...s.conditions, newItem] }));
  },

  updateCondition: async (id, data) => {
    await db.update(conditions).set(data).where(eq(conditions.id, id));
    set((s) => ({
      conditions: s.conditions.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
  },

  deleteCondition: async (id) => {
    await db.delete(conditions).where(eq(conditions.id, id));
    set((s) => ({ conditions: s.conditions.filter((c) => c.id !== id) }));
  },

  addMedication: async (data) => {
    const result = await db.insert(medications).values({
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate,
      instructions: data.instructions,
    }).returning();
    const newItem: Medication = {
      ...data,
      id: result[0].id,
      active: true,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ medications: [...s.medications, newItem] }));
  },

  updateMedication: async (id, data) => {
    await db.update(medications).set(data).where(eq(medications.id, id));
    set((s) => ({
      medications: s.medications.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  },

  deleteMedication: async (id) => {
    await db.delete(medications).where(eq(medications.id, id));
    set((s) => ({ medications: s.medications.filter((m) => m.id !== id) }));
  },

  addAllergy: async (data) => {
    const result = await db.insert(allergies).values({
      name: data.name,
      severity: data.severity,
      reaction: data.reaction,
    }).returning();
    const newItem: Allergy = {
      ...data,
      id: result[0].id,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ allergies: [...s.allergies, newItem] }));
  },

  updateAllergy: async (id, data) => {
    await db.update(allergies).set(data).where(eq(allergies.id, id));
    set((s) => ({
      allergies: s.allergies.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  deleteAllergy: async (id) => {
    await db.delete(allergies).where(eq(allergies.id, id));
    set((s) => ({ allergies: s.allergies.filter((a) => a.id !== id) }));
  },

  getCriticalAllergies: () => get().allergies.filter((a) => a.severity === 'alta'),

  getTodayMedications: () => get().medications.filter((m) => m.active !== false),
}));
