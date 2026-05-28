import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://bdxnlpyxtfjzfycrqlwk.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeG5scHl4dGZqemZ5Y3JxbHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODc1MzksImV4cCI6MjA5NTU2MzUzOX0.HuqCnhRKWJIxcLo35sz-2Zrb2vLFFmjEYbsZsSJpVAs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          cedula: string | null;
          phone: string | null;
          blood_type: string | null;
          weight_kg: number | null;
          height_cm: number | null;
          default_ars: string | null;
          default_plan: string | null;
          affiliate_number: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          doctor_id: string | null;
          doctor_name: string;
          specialty: string;
          hospital: string;
          appointment_date: string;
          appointment_time: string;
          status: string;
          copay: number | null;
          confirmation_number: string | null;
          qr_code: string | null;
          ai_wait_time: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
    };
  };
};
