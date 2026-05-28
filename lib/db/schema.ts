import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  doctorPhoto: text('doctor_photo'),
  specialty: text('specialty').notNull(),
  hospital: text('hospital').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  status: text('status').notNull().default('upcoming'),
  copay: integer('copay'),
  confirmationNumber: text('confirmation_number'),
  qrCode: text('qr_code'),
  aiWaitTime: integer('ai_wait_time'),
  notes: text('notes'),
  syncedAt: text('synced_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const conditions = sqliteTable('conditions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  status: text('status').default('activa'),
  diagnosisYear: text('diagnosis_year'),
  notes: text('notes'),
  syncedAt: text('synced_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const medications = sqliteTable('medications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  dosage: text('dosage'),
  frequency: text('frequency').notNull(),
  startDate: text('start_date'),
  instructions: text('instructions'),
  active: integer('active', { mode: 'boolean' }).default(true),
  syncedAt: text('synced_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const allergies = sqliteTable('allergies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  severity: text('severity').notNull(),
  reaction: text('reaction'),
  syncedAt: text('synced_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  category: text('category'),
  localUri: text('local_uri'),
  remoteUrl: text('remote_url'),
  size: integer('size'),
  mimeType: text('mime_type'),
  uploadedAt: text('uploaded_at'),
  syncedAt: text('synced_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableName: text('table_name').notNull(),
  recordId: text('record_id').notNull(),
  operation: text('operation').notNull(), // insert | update | delete
  payload: text('payload'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export type InsertAppointment = typeof appointments.$inferInsert;
export type SelectAppointment = typeof appointments.$inferSelect;
export type InsertCondition = typeof conditions.$inferInsert;
export type SelectCondition = typeof conditions.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;
export type SelectMedication = typeof medications.$inferSelect;
export type InsertAllergy = typeof allergies.$inferInsert;
export type SelectAllergy = typeof allergies.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
