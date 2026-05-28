import { supabase } from '../supabase';
import type { Appointment } from '@/types/appointment';

export async function fetchRemoteAppointments(userId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id: r.id,
    doctorId: r.doctor_id ?? '',
    doctorName: r.doctor_name,
    specialty: r.specialty,
    hospital: r.hospital,
    date: r.appointment_date,
    time: r.appointment_time,
    status: r.status as Appointment['status'],
    copay: r.copay ?? undefined,
    confirmationNumber: r.confirmation_number ?? undefined,
    qrCode: r.qr_code ?? undefined,
    aiWaitTime: r.ai_wait_time ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function cancelRemoteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}
