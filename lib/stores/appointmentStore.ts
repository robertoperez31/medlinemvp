import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid/non-secure';
import { create } from 'zustand';
import { db } from '../db';
import { appointments } from '../db/schema';
import type { Appointment } from '@/types/appointment';

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  loadAppointments: () => Promise<void>;
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt'>) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  getUpcomingAppointments: () => Appointment[];
  getPastAppointments: () => Appointment[];
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,

  loadAppointments: async () => {
    set({ isLoading: true });
    try {
      const rows = await db.select().from(appointments);
      set({
        appointments: rows.map((r) => ({
          id: r.id,
          doctorId: r.doctorId,
          doctorName: r.doctorName,
          doctorPhoto: r.doctorPhoto ?? undefined,
          specialty: r.specialty,
          hospital: r.hospital,
          date: r.date,
          time: r.time,
          status: r.status as Appointment['status'],
          copay: r.copay ?? undefined,
          confirmationNumber: r.confirmationNumber ?? undefined,
          qrCode: r.qrCode ?? undefined,
          aiWaitTime: r.aiWaitTime ?? undefined,
          notes: r.notes ?? undefined,
          syncedAt: r.syncedAt ?? undefined,
          createdAt: r.createdAt ?? new Date().toISOString(),
        })),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addAppointment: async (data) => {
    const id = nanoid();
    const confirmationNumber = `IS-${Date.now().toString(36).toUpperCase()}`;
    const qrCode = JSON.stringify({ id, confirmationNumber, doctor: data.doctorName, date: data.date, time: data.time });

    const newAppointment: Appointment = {
      ...data,
      id,
      confirmationNumber,
      qrCode,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    await db.insert(appointments).values({
      id: newAppointment.id,
      doctorId: newAppointment.doctorId,
      doctorName: newAppointment.doctorName,
      doctorPhoto: newAppointment.doctorPhoto,
      specialty: newAppointment.specialty,
      hospital: newAppointment.hospital,
      date: newAppointment.date,
      time: newAppointment.time,
      status: newAppointment.status,
      copay: newAppointment.copay,
      confirmationNumber: newAppointment.confirmationNumber,
      qrCode: newAppointment.qrCode,
      aiWaitTime: newAppointment.aiWaitTime,
      notes: newAppointment.notes,
    });

    set((state) => ({ appointments: [newAppointment, ...state.appointments] }));
    return newAppointment;
  },

  updateAppointment: async (id, data) => {
    await db.update(appointments).set(data).where(eq(appointments.id, id));
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  cancelAppointment: async (id) => {
    await db
      .update(appointments)
      .set({ status: 'cancelled' })
      .where(eq(appointments.id, id));
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      ),
    }));
  },

  getUpcomingAppointments: () => {
    const { appointments: appts } = get();
    const today = new Date().toISOString().split('T')[0];
    return appts
      .filter((a) => a.status === 'upcoming' && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  getPastAppointments: () => {
    const { appointments: appts } = get();
    const today = new Date().toISOString().split('T')[0];
    return appts
      .filter((a) => a.status === 'completed' || a.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
}));
