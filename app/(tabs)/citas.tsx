import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAppointmentStore } from '@/lib/stores/appointmentStore';
import type { Appointment } from '@/types/appointment';

function StatusBadge({ status }: { status: Appointment['status'] }) {
  const config = {
    upcoming: { bg: '#EEF2FF', text: '#4338CA', label: 'Próxima' },
    completed: { bg: '#F0FDFA', text: '#0D9488', label: 'Completada' },
    cancelled: { bg: '#F8FAFC', text: '#64748B', label: 'Cancelada' },
  }[status];
  return (
    <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: config.bg }}>
      <Text className="text-xs font-semibold font-[Inter_600SemiBold]" style={{ color: config.text }}>
        {config.label}
      </Text>
    </View>
  );
}

function AppointmentCard({
  appointment,
  onView,
  onCancel,
}: {
  appointment: Appointment;
  onView: () => void;
  onCancel?: () => void;
}) {
  const d = new Date(appointment.date + 'T00:00:00');
  const dateStr = format(d, "EEE d 'de' MMM", { locale: es });
  const isCancelled = appointment.status === 'cancelled';

  return (
    <Pressable
      onPress={onView}
      className="bg-white rounded-2xl p-4 mb-3 border border-[#E2E8F0]"
      style={{ opacity: isCancelled ? 0.6 : 1 }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-base font-bold text-[#0F172A] font-[Inter_700Bold]" numberOfLines={1}>
            {appointment.doctorName}
          </Text>
          <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">
            {appointment.specialty}
          </Text>
        </View>
        <StatusBadge status={appointment.status} />
      </View>

      <Text className="text-sm text-[#64748B] mb-3 font-[Inter_400Regular]" numberOfLines={1}>
        🏥 {appointment.hospital}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-3">
          <Text className="text-sm text-[#0F172A] font-[Inter_500Medium] capitalize">
            📅 {dateStr}
          </Text>
          <Text className="text-sm text-[#0F172A] font-[Inter_500Medium]">
            ⏰ {appointment.time}
          </Text>
        </View>
        {appointment.copay != null && (
          <Text className="text-sm font-bold text-[#0D9488] font-[Inter_700Bold]">
            RD$ {appointment.copay.toLocaleString('es-DO')}
          </Text>
        )}
      </View>

      {appointment.status === 'upcoming' && (
        <View className="flex-row gap-2 mt-3 pt-3 border-t border-[#F1F5F9]">
          <Pressable
            onPress={onView}
            className="flex-1 bg-[#EEF2FF] h-9 rounded-lg items-center justify-center"
          >
            <Text className="text-[#4338CA] text-sm font-semibold font-[Inter_600SemiBold]">
              Ver QR
            </Text>
          </Pressable>
          {onCancel && (
            <Pressable
              onPress={onCancel}
              className="flex-1 border border-[#FCA5A5] h-9 rounded-lg items-center justify-center"
            >
              <Text className="text-[#DC2626] text-sm font-semibold font-[Inter_600SemiBold]">
                Cancelar
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

function QRModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const d = new Date(appointment.date + 'T00:00:00');
  const dateStr = format(d, "EEEE d 'de' MMMM yyyy", { locale: es });
  const qrData = appointment.qrCode ?? JSON.stringify({ id: appointment.id, doctor: appointment.doctorName });

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          {/* Handle */}
          <View className="w-10 h-1 bg-[#E2E8F0] rounded-full self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-xl font-bold text-[#0F172A] font-[Inter_700Bold]">
                Pase de Cita
              </Text>
              <Text className="text-sm text-[#64748B] font-[Inter_400Regular]">
                #{appointment.confirmationNumber ?? appointment.id}
              </Text>
            </View>
            <Pressable onPress={onClose} className="w-8 h-8 bg-[#F1F5F9] rounded-full items-center justify-center">
              <Text className="text-[#64748B] font-bold">✕</Text>
            </Pressable>
          </View>

          {/* QR Code */}
          <View className="bg-[#F8FAFC] rounded-2xl p-6 items-center mb-5">
            <QRCode value={qrData} size={180} color="#0F172A" backgroundColor="transparent" />
            <Text className="text-xs text-[#94A3B8] mt-3 font-[Inter_400Regular]">
              Muestra este código en recepción
            </Text>
          </View>

          {/* Info */}
          <View className="bg-[#F8FAFC] rounded-xl p-4 mb-4">
            <InfoRow label="Médico" value={appointment.doctorName} />
            <InfoRow label="Especialidad" value={appointment.specialty} />
            <InfoRow label="Hospital" value={appointment.hospital} />
            <InfoRow label="Fecha" value={dateStr} capitalize />
            <InfoRow label="Hora" value={appointment.time} last />
            {appointment.copay != null && (
              <InfoRow label="Copago" value={`RD$ ${appointment.copay.toLocaleString('es-DO')}`} last />
            )}
          </View>

          {/* AI wait time */}
          {appointment.aiWaitTime != null && (
            <View className="bg-[#EEF2FF] rounded-xl px-4 py-3 mb-4 flex-row items-center gap-2">
              <Text>⏱</Text>
              <Text className="text-[#4338CA] text-sm font-[Inter_500Medium]">
                Tiempo estimado de espera: {appointment.aiWaitTime} minutos
              </Text>
            </View>
          )}

          <Pressable onPress={onClose} className="bg-[#4338CA] h-12 rounded-xl items-center justify-center">
            <Text className="text-white font-semibold font-[Inter_600SemiBold]">Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value, capitalize, last }: { label: string; value: string; capitalize?: boolean; last?: boolean }) {
  return (
    <View className={`flex-row justify-between py-2 ${!last ? 'border-b border-[#E2E8F0]' : ''}`}>
      <Text className="text-[#64748B] text-sm font-[Inter_400Regular]">{label}</Text>
      <Text
        className={`text-[#0F172A] text-sm font-medium font-[Inter_500Medium] flex-1 text-right ${capitalize ? 'capitalize' : ''}`}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export default function CitasScreen() {
  const { appointments, loadAppointments, cancelAppointment, getUpcomingAppointments, getPastAppointments } = useAppointmentStore();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  }

  function handleCancel(appointment: Appointment) {
    Alert.alert(
      'Cancelar cita',
      `¿Estás seguro de que deseas cancelar tu cita con ${appointment.doctorName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => cancelAppointment(appointment.id),
        },
      ]
    );
  }

  const upcoming = getUpcomingAppointments();
  const past = getPastAppointments();
  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-5 border-b border-[#E2E8F0]">
        <Text className="text-2xl font-bold text-[#0F172A] font-[Inter_700Bold]">Mis Citas</Text>

        {/* Tabs */}
        <View className="flex-row mt-4 bg-[#F1F5F9] rounded-xl p-1">
          {(['upcoming', 'past'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg items-center ${tab === t ? 'bg-white shadow-sm' : ''}`}
            >
              <Text
                className={`text-sm font-semibold font-[Inter_600SemiBold] ${
                  tab === t ? 'text-[#0F172A]' : 'text-[#64748B]'
                }`}
              >
                {t === 'upcoming' ? `Próximas (${upcoming.length})` : `Historial (${past.length})`}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayed.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">{tab === 'upcoming' ? '📅' : '🗓️'}</Text>
            <Text className="text-[#0F172A] font-bold text-lg mb-2 font-[Inter_700Bold]">
              {tab === 'upcoming' ? 'Sin citas próximas' : 'Sin historial'}
            </Text>
            <Text className="text-[#64748B] text-sm text-center font-[Inter_400Regular]">
              {tab === 'upcoming'
                ? 'Agenda tu próxima cita médica'
                : 'Tus citas anteriores aparecerán aquí'}
            </Text>
          </View>
        ) : (
          displayed.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onView={() => setSelectedAppointment(appt)}
              onCancel={appt.status === 'upcoming' ? () => handleCancel(appt) : undefined}
            />
          ))
        )}
        <View className="h-6" />
      </ScrollView>

      {selectedAppointment && (
        <QRModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </View>
  );
}
