import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const expo = SQLite.openDatabaseSync('instasalud.db', { enableChangeListener: true });

export const db = drizzle(expo, { schema });

export async function initDatabase() {
  await expo.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      doctor_photo TEXT,
      specialty TEXT NOT NULL,
      hospital TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming',
      copay INTEGER,
      confirmation_number TEXT,
      qr_code TEXT,
      ai_wait_time INTEGER,
      notes TEXT,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'activa',
      diagnosis_year TEXT,
      notes TEXT,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT NOT NULL,
      start_date TEXT,
      instructions TEXT,
      active INTEGER DEFAULT 1,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS allergies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      severity TEXT NOT NULL,
      reaction TEXT,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      local_uri TEXT,
      remote_url TEXT,
      size INTEGER,
      mime_type TEXT,
      uploaded_at TEXT,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
