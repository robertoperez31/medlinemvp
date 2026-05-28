import * as LocalAuthentication from 'expo-local-authentication';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthStore } from '@/lib/stores/authStore';
import { syncManager } from '@/lib/sync/offlineSync';
import type { BloodType } from '@/types/medical';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function ProfileRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3 border-b border-[#F1F5F9]"
    >
      <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">{label}</Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-sm text-[#0F172A] font-[Inter_500Medium] max-w-48" numberOfLines={1}>
          {value || '—'}
        </Text>
        {onPress && <Text className="text-[#94A3B8] text-xs">›</Text>}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View className="flex-row items-center gap-2 mt-5 mb-2">
      <Text className="text-base">{icon}</Text>
      <Text className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-[Inter_700Bold]">
        {title}
      </Text>
    </View>
  );
}

export default function PerfilScreen() {
  const router = useRouter();
  const { user, updateProfile, logout, isBiometricEnabled, setBiometricEnabled } = useAuthStore();
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync] = useState<Date | null>(null);
  const [editField, setEditField] = useState<{ key: string; label: string; value: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkSync();
    checkBiometric();
  }, []);

  async function checkSync() {
    const count = await syncManager.getPendingCount();
    setPendingSync(count);
  }

  async function checkBiometric() {
    const available = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(available && enrolled);
  }

  async function handleSync() {
    if (!user) return;
    setIsSyncing(true);
    try {
      const result = await syncManager.syncToCloud(user.id);
      Alert.alert(
        result.success ? 'Sincronización completada' : 'Sincronización parcial',
        result.success
          ? `${result.synced} cambio${result.synced !== 1 ? 's' : ''} sincronizado${result.synced !== 1 ? 's' : ''}`
          : `${result.synced} sincronizados, ${result.errors} error${result.errors !== 1 ? 'es' : ''}`
      );
      await checkSync();
    } finally {
      setIsSyncing(false);
    }
  }

  function handleEdit(key: string, label: string, value?: string) {
    setEditField({ key, label, value: value ?? '' });
    setEditValue(value ?? '');
  }

  function saveEdit() {
    if (!editField) return;
    const updates: Record<string, string | number | undefined> = {};
    if (editField.key === 'weightKg' || editField.key === 'heightCm') {
      const num = parseFloat(editValue);
      if (!isNaN(num)) updates[editField.key] = num;
    } else {
      updates[editField.key] = editValue;
    }
    updateProfile(updates as any);
    setEditField(null);
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => Alert.alert('Por implementar', 'Contacta soporte@instasalud.do') },
      ]
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? 'U';

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-[#4338CA] pt-14 pb-10 px-5 items-center">
          <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">{firstName[0]?.toUpperCase()}</Text>
          </View>
          <Text className="text-white text-xl font-bold font-[Inter_700Bold]">{user?.name}</Text>
          <Text className="text-white/70 text-sm mt-0.5 font-[Inter_400Regular]">{user?.email}</Text>
        </View>

        <View className="px-5 -mt-4">
          {/* Personal info */}
          <View className="bg-white rounded-2xl px-4 border border-[#E2E8F0] shadow-sm">
            <SectionHeader title="Información personal" icon="👤" />
            <ProfileRow label="Nombre" value={user?.name} onPress={() => handleEdit('name', 'Nombre', user?.name)} />
            <ProfileRow label="Correo" value={user?.email} />
            <ProfileRow label="Cédula" value={user?.cedula} onPress={() => handleEdit('cedula', 'Cédula', user?.cedula)} />
            <ProfileRow label="Teléfono" value={user?.phone} onPress={() => handleEdit('phone', 'Teléfono', user?.phone)} />
          </View>

          {/* Health info */}
          <View className="bg-white rounded-2xl px-4 mt-3 border border-[#E2E8F0]">
            <SectionHeader title="Datos de salud" icon="🩺" />
            <ProfileRow label="Tipo de sangre" value={user?.bloodType} onPress={() => handleEdit('bloodType', 'Tipo de sangre', user?.bloodType)} />
            <ProfileRow label="Peso" value={user?.weightKg ? `${user.weightKg} kg` : undefined} onPress={() => handleEdit('weightKg', 'Peso (kg)', String(user?.weightKg ?? ''))} />
            <ProfileRow label="Estatura" value={user?.heightCm ? `${user.heightCm} cm` : undefined} onPress={() => handleEdit('heightCm', 'Estatura (cm)', String(user?.heightCm ?? ''))} />
          </View>

          {/* Insurance */}
          <View className="bg-white rounded-2xl px-4 mt-3 border border-[#E2E8F0]">
            <SectionHeader title="Seguro médico" icon="🏥" />
            <ProfileRow label="ARS" value={user?.defaultArs} onPress={() => handleEdit('defaultArs', 'ARS predeterminado', user?.defaultArs)} />
            <ProfileRow label="Plan" value={user?.defaultPlan} onPress={() => handleEdit('defaultPlan', 'Plan', user?.defaultPlan)} />
            <ProfileRow label="No. Afiliado" value={user?.affiliateNumber} onPress={() => handleEdit('affiliateNumber', 'Número de afiliado', user?.affiliateNumber)} />
          </View>

          {/* Emergency contact */}
          <View className="bg-white rounded-2xl px-4 mt-3 border border-[#E2E8F0]">
            <SectionHeader title="Contacto de emergencia" icon="🆘" />
            <ProfileRow label="Nombre" value={user?.emergencyContactName} onPress={() => handleEdit('emergencyContactName', 'Nombre', user?.emergencyContactName)} />
            <ProfileRow label="Teléfono" value={user?.emergencyContactPhone} onPress={() => handleEdit('emergencyContactPhone', 'Teléfono', user?.emergencyContactPhone)} />
          </View>

          {/* Security */}
          <View className="bg-white rounded-2xl px-4 mt-3 border border-[#E2E8F0]">
            <SectionHeader title="Seguridad" icon="🔒" />
            {biometricAvailable && (
              <View className="flex-row items-center justify-between py-3 border-b border-[#F1F5F9]">
                <View>
                  <Text className="text-sm text-[#0F172A] font-[Inter_500Medium]">Autenticación biométrica</Text>
                  <Text className="text-xs text-[#64748B] font-[Inter_400Regular]">Face ID / Touch ID</Text>
                </View>
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#4338CA' }}
                  thumbColor="white"
                />
              </View>
            )}
            <Pressable className="py-3 border-b border-[#F1F5F9]">
              <Text className="text-sm text-[#4338CA] font-[Inter_500Medium]">Cambiar contraseña →</Text>
            </Pressable>
          </View>

          {/* Sync */}
          <View className="bg-white rounded-2xl px-4 mt-3 border border-[#E2E8F0]">
            <SectionHeader title="Sincronización" icon="🔄" />
            <View className="py-3 border-b border-[#F1F5F9]">
              <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">
                {pendingSync > 0
                  ? `${pendingSync} cambio${pendingSync > 1 ? 's' : ''} pendiente${pendingSync > 1 ? 's' : ''}`
                  : 'Todo sincronizado ✓'}
              </Text>
            </View>
            <Pressable
              onPress={handleSync}
              disabled={isSyncing}
              className="py-3"
            >
              <Text className="text-sm text-[#4338CA] font-[Inter_500Medium]">
                {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora →'}
              </Text>
            </Pressable>
          </View>

          {/* Privacy */}
          <View className="bg-white rounded-2xl px-4 mt-3 border border-[#E2E8F0] mb-3">
            <SectionHeader title="Privacidad" icon="🛡️" />
            <Pressable className="py-3 border-b border-[#F1F5F9]">
              <Text className="text-sm text-[#4338CA] font-[Inter_500Medium]">Exportar mis datos →</Text>
            </Pressable>
            <Pressable onPress={handleDeleteAccount} className="py-3">
              <Text className="text-sm text-[#DC2626] font-[Inter_500Medium]">Eliminar mi cuenta →</Text>
            </Pressable>
          </View>

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl h-12 items-center justify-center mb-8"
          >
            <Text className="text-[#DC2626] font-semibold font-[Inter_600SemiBold]">Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit modal */}
      {editField && (
        <Modal animationType="slide" transparent presentationStyle="overFullScreen">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <Text className="text-xl font-bold mb-4 font-[Inter_700Bold]">Editar {editField.label}</Text>
              <TextInput
                className="border border-[#4338CA] rounded-xl px-4 h-12 text-base text-[#0F172A] mb-4"
                value={editValue}
                onChangeText={setEditValue}
                autoFocus
                placeholder={editField.label}
                placeholderTextColor="#94A3B8"
              />
              <View className="flex-row gap-3">
                <Pressable onPress={() => setEditField(null)} className="flex-1 h-12 border border-[#E2E8F0] rounded-xl items-center justify-center">
                  <Text className="text-[#64748B] font-semibold font-[Inter_600SemiBold]">Cancelar</Text>
                </Pressable>
                <Pressable onPress={saveEdit} className="flex-1 h-12 bg-[#4338CA] rounded-xl items-center justify-center">
                  <Text className="text-white font-semibold font-[Inter_600SemiBold]">Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
