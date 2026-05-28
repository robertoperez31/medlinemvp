import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { supabase } from '../supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cedula?: string;
  phone?: string;
  bloodType?: string;
  weightKg?: number;
  heightCm?: number;
  defaultArs?: string;
  defaultPlan?: string;
  affiliateNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  cedula?: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isBiometricEnabled: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setBiometricEnabled: (isBiometricEnabled) => {
    SecureStore.setItemAsync('biometric_enabled', String(isBiometricEnabled));
    set({ isBiometricEnabled });
  },

  updateProfile: (updates) => {
    const { user } = get();
    if (user) {
      const updated = { ...user, ...updates };
      set({ user: updated });
      supabase.from('profiles').update({
        name: updated.name,
        cedula: updated.cedula,
        phone: updated.phone,
        blood_type: updated.bloodType,
        weight_kg: updated.weightKg,
        height_cm: updated.heightCm,
        default_ars: updated.defaultArs,
        default_plan: updated.defaultPlan,
        affiliate_number: updated.affiliateNumber,
        emergency_contact_name: updated.emergencyContactName,
        emergency_contact_phone: updated.emergencyContactPhone,
      }).eq('id', user.id);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        set({
          user: {
            id: data.user.id,
            email: data.user.email ?? '',
            name: profile?.name ?? '',
            cedula: profile?.cedula ?? undefined,
            phone: profile?.phone ?? undefined,
            bloodType: profile?.blood_type ?? undefined,
            weightKg: profile?.weight_kg ?? undefined,
            heightCm: profile?.height_cm ?? undefined,
            defaultArs: profile?.default_ars ?? undefined,
            defaultPlan: profile?.default_plan ?? undefined,
            affiliateNumber: profile?.affiliate_number ?? undefined,
            emergencyContactName: profile?.emergency_contact_name ?? undefined,
            emergencyContactPhone: profile?.emergency_contact_phone ?? undefined,
          },
          isAuthenticated: true,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          name: data.name,
          cedula: data.cedula,
          phone: data.phone,
        });
        set({
          user: {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            cedula: data.cedula,
            phone: data.phone,
          },
          isAuthenticated: true,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('biometric_enabled');
    set({ user: null, isAuthenticated: false });
  },

  loadSession: async () => {
    try {
      const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        set({
          user: {
            id: data.session.user.id,
            email: data.session.user.email ?? '',
            name: profile?.name ?? '',
            cedula: profile?.cedula ?? undefined,
            phone: profile?.phone ?? undefined,
            bloodType: profile?.blood_type ?? undefined,
            weightKg: profile?.weight_kg ?? undefined,
            heightCm: profile?.height_cm ?? undefined,
            defaultArs: profile?.default_ars ?? undefined,
            defaultPlan: profile?.default_plan ?? undefined,
            affiliateNumber: profile?.affiliate_number ?? undefined,
            emergencyContactName: profile?.emergency_contact_name ?? undefined,
            emergencyContactPhone: profile?.emergency_contact_phone ?? undefined,
          },
          isAuthenticated: true,
          isBiometricEnabled: biometricEnabled === 'true',
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
