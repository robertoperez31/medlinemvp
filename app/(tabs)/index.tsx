import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAppointmentStore } from '@/lib/stores/appointmentStore';
import { useMedicalStore } from '@/lib/stores/medicalStore';
import { useDocumentStore } from '@/lib/stores/documentStore';
import { syncManager } from '@/lib/sync/offlineSync';
import { useState } from 'react';

interface QuickAction {
  emoji: string;
  label: string;
  color: string;
  bg: string;
  route: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { emoji: '📅', label: 'Agendar', color: '#4338CA', bg: '#EEF2FF', route: '/(tabs)/agendar' },
  { emoji: '🗓️', label: 'Mis citas', color: '#0D9488', bg: '#F0FDFA', route: '/(tabs)/citas' },
  { emoji: '📋', label: 'Historial', color: '#7C3AED', bg: '#F5F3FF', route: '/(tabs)/historial' },
  { emoji: '📁', label: 'Docs', color: '#D97706', bg: '#FFFBEB', route: '/(tabs)/documentos' },
  { emoji: '👤', label: 'Perfil', color: '#0369A1', bg: '#F0F9FF', route: '/(tabs)/perfil' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { appointments, loadAppointments, getUpcomingAppointments } = useAppointmentStore();
  const { loadAll, getTodayMedications } = useMedicalStore();
  const { loadDocuments, documents } = useDocumentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadAll();
    loadAppointments();
    loadDocuments();
    checkSync();
  }, []);

  async function checkSync() {
    const count = await syncManager.getPendingCount();
    setPendingSync(count);
    const online = await syncManager.isOnline();
    setIsOnline(online);
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadAll(), loadAppointments(), loadDocuments(), checkSync()]);
    setRefreshing(false);
  }

  const upcoming = getUpcomingAppointments();
  const nextAppointment = upcoming[0];
  const todayMeds = getTodayMedications();
  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return format(d, "EEEE d 'de' MMMM", { locale: es });
  }

  return (
    <ScrollView
      className="flex-1 bg-[#F8FAFC]"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-[#4338CA] pt-14 pb-8 px-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/70 text-sm font-[Inter_400Regular]">
              ¡Buen día!
            </Text>
            <Text className="text-white text-2xl font-bold font-[Inter_700Bold]">
              {firstName}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
            <Text className="text-white text-lg font-bold">{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row mt-6 gap-3">
          <View className="flex-1 bg-white/10 rounded-xl p-3">
            <Text className="text-white text-xl font-bold font-[Inter_700Bold]">{upcoming.length}</Text>
            <Text className="text-white/70 text-xs font-[Inter_400Regular]">Próximas citas</Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-xl p-3">
            <Text className="text-white text-xl font-bold font-[Inter_700Bold]">{documents.length}</Text>
            <Text className="text-white/70 text-xs font-[Inter_400Regular]">Documentos</Text>
          </View>
          <View className="flex-1 bg-white/10 rounded-xl p-3">
            <Text className="text-white text-xl font-bold font-[Inter_700Bold]">{todayMeds.length}</Text>
            <Text className="text-white/70 text-xs font-[Inter_400Regular]">Medicamentos hoy</Text>
          </View>
        </View>
      </View>

      <View className="px-5 -mt-4">
        {/* Sync / Offline indicator */}
        {(!isOnline || pendingSync > 0) && (
          <View className={`rounded-xl px-4 py-2.5 mb-4 flex-row items-center gap-2 ${
            !isOnline ? 'bg-[#FFFBEB] border border-[#FDE68A]' : 'bg-[#EEF2FF] border border-[#C7D2FE]'
          }`}>
            <Text>{!isOnline ? '📶' : '🔄'}</Text>
            <Text className={`text-sm font-[Inter_500Medium] ${!isOnline ? 'text-[#92400E]' : 'text-[#4338CA]'}`}>
              {!isOnline
                ? `Sin conexión${pendingSync > 0 ? ` • ${pendingSync} cambio${pendingSync > 1 ? 's' : ''} pendiente${pendingSync > 1 ? 's' : ''}` : ''}`
                : `${pendingSync} cambio${pendingSync > 1 ? 's' : ''} pendiente${pendingSync > 1 ? 's' : ''} de sincronizar`
              }
            </Text>
          </View>
        )}

        {/* Next appointment highlight */}
        {nextAppointment && (
          <Pressable
            onPress={() => router.push('/(tabs)/citas')}
            className="bg-white rounded-2xl p-4 mb-4 border border-[#E2E8F0] shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-[#4338CA] uppercase tracking-wide font-[Inter_600SemiBold]">
                Próxima cita
              </Text>
              <View className="bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                <Text className="text-[#4338CA] text-xs font-[Inter_500Medium]">Ver QR →</Text>
              </View>
            </View>
            <Text className="text-base font-bold text-[#0F172A] font-[Inter_700Bold]">
              {nextAppointment.doctorName}
            </Text>
            <Text className="text-[#64748B] text-sm mt-0.5 font-[Inter_400Regular]">
              {nextAppointment.specialty} • {nextAppointment.hospital}
            </Text>
            <View className="flex-row items-center mt-2 gap-3">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm">📅</Text>
                <Text className="text-[#0F172A] text-sm font-medium font-[Inter_500Medium] capitalize">
                  {formatDate(nextAppointment.date)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm">⏰</Text>
                <Text className="text-[#0F172A] text-sm font-medium font-[Inter_500Medium]">
                  {nextAppointment.time}
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Today's medications */}
        {todayMeds.length > 0 && (
          <View className="bg-[#ECFDF5] rounded-2xl p-4 mb-4 border border-[#A7F3D0]">
            <Text className="text-[#059669] font-semibold text-sm mb-2 font-[Inter_600SemiBold]">
              💊 Medicamentos de hoy ({todayMeds.length})
            </Text>
            {todayMeds.slice(0, 3).map((med) => (
              <Text key={med.id} className="text-[#065F46] text-sm font-[Inter_400Regular]">
                • {med.name} — {med.frequency}
              </Text>
            ))}
            {todayMeds.length > 3 && (
              <Text className="text-[#059669] text-xs mt-1 font-[Inter_400Regular]">
                +{todayMeds.length - 3} más
              </Text>
            )}
          </View>
        )}

        {/* Quick actions */}
        <Text className="text-base font-bold text-[#0F172A] mb-3 font-[Inter_700Bold]">
          Acceso rápido
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.route}
              onPress={() => router.push(action.route as any)}
              className="rounded-2xl p-4 items-center justify-center"
              style={{
                width: '30%',
                backgroundColor: action.bg,
                borderWidth: 1,
                borderColor: action.bg,
                minHeight: 80,
              }}
            >
              <Text className="text-3xl mb-1.5">{action.emoji}</Text>
              <Text
                className="text-xs font-semibold text-center font-[Inter_600SemiBold]"
                style={{ color: action.color }}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* No appointments empty state */}
        {upcoming.length === 0 && (
          <View className="bg-white rounded-2xl p-6 items-center border border-[#E2E8F0] mb-6">
            <Text className="text-4xl mb-3">📅</Text>
            <Text className="text-[#0F172A] font-bold text-base mb-1 font-[Inter_700Bold]">
              Sin citas próximas
            </Text>
            <Text className="text-[#64748B] text-sm text-center mb-4 font-[Inter_400Regular]">
              Agenda tu próxima cita médica en minutos
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/agendar')}
              className="bg-[#4338CA] px-6 h-11 rounded-xl items-center justify-center"
            >
              <Text className="text-white font-semibold font-[Inter_600SemiBold]">Agendar cita</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
