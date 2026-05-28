import NetInfo from '@react-native-community/netinfo';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { appointments, allergies, conditions, documents, medications, syncQueue } from '../db/schema';
import { supabase } from '../supabase';

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: number;
}

export class OfflineSyncManager {
  private static instance: OfflineSyncManager;

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  }

  async getPendingCount(): Promise<number> {
    const pending = await db.select().from(syncQueue);
    return pending.length;
  }

  async syncToCloud(userId: string): Promise<SyncResult> {
    const online = await this.isOnline();
    if (!online) return { success: false, synced: 0, errors: 0 };

    const pending = await db.select().from(syncQueue);
    let synced = 0;
    let errors = 0;

    for (const item of pending) {
      try {
        const payload = item.payload ? JSON.parse(item.payload) : {};
        const tableMap: Record<string, string> = {
          appointments: 'appointments',
          conditions: 'medical_conditions',
          medications: 'medications',
          allergies: 'allergies',
          documents: 'documents',
        };
        const remoteTable = tableMap[item.tableName];
        if (!remoteTable) continue;

        if (item.operation === 'insert' || item.operation === 'update') {
          await supabase.from(remoteTable).upsert({ ...payload, user_id: userId });
        } else if (item.operation === 'delete') {
          await supabase.from(remoteTable).delete().eq('id', item.recordId);
        }

        await db.delete(syncQueue).where(eq(syncQueue.id, item.id));
        await this.markSynced(item.tableName, item.recordId);
        synced++;
      } catch {
        errors++;
      }
    }

    return { success: errors === 0, synced, errors };
  }

  async syncFromCloud(userId: string): Promise<SyncResult> {
    const online = await this.isOnline();
    if (!online) return { success: false, synced: 0, errors: 0 };

    let synced = 0;
    let errors = 0;

    try {
      const { data: remoteAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId);

      if (remoteAppointments) {
        for (const appt of remoteAppointments) {
          await db.insert(appointments).values({
            id: appt.id,
            doctorId: appt.doctor_id ?? '',
            doctorName: appt.doctor_name,
            specialty: appt.specialty,
            hospital: appt.hospital,
            date: appt.appointment_date,
            time: appt.appointment_time,
            status: appt.status,
            copay: appt.copay,
            confirmationNumber: appt.confirmation_number,
            qrCode: appt.qr_code,
            aiWaitTime: appt.ai_wait_time,
            syncedAt: new Date().toISOString(),
          }).onConflictDoUpdate({
            target: appointments.id,
            set: { syncedAt: new Date().toISOString() },
          });
          synced++;
        }
      }
    } catch {
      errors++;
    }

    return { success: errors === 0, synced, errors };
  }

  resolveConflict<T extends { syncedAt?: string | null; createdAt?: string | null }>(
    local: T,
    remote: T
  ): T {
    const localTime = local.syncedAt ?? local.createdAt ?? '0';
    const remoteTime = remote.syncedAt ?? remote.createdAt ?? '0';
    return localTime >= remoteTime ? local : remote;
  }

  async queueChange(tableName: string, recordId: string, operation: string, payload: object) {
    await db.insert(syncQueue).values({
      tableName,
      recordId: String(recordId),
      operation,
      payload: JSON.stringify(payload),
    });
  }

  private async markSynced(tableName: string, recordId: string) {
    const now = new Date().toISOString();
    const tableMap: Record<string, typeof appointments> = {
      appointments,
    };
    const table = tableMap[tableName];
    if (table && tableName === 'appointments') {
      await db.update(appointments).set({ syncedAt: now }).where(eq(appointments.id, recordId));
    }
  }
}

export const syncManager = OfflineSyncManager.getInstance();
