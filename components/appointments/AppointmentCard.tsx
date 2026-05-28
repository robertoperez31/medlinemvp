import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment, AppointmentStatus } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

function formatRD(amount: number): string {
  return `RD$ ${amount.toLocaleString('es-DO')}`;
}

function formatSpanishDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const formatted = format(date, "EEEE d 'de' MMMM", { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  upcoming: {
    label: 'Próxima',
    bgColor: '#EEF2FF',
    textColor: '#4338CA',
    dotColor: '#4338CA',
  },
  completed: {
    label: 'Completada',
    bgColor: '#F0FDFA',
    textColor: '#0D9488',
    dotColor: '#0D9488',
  },
  cancelled: {
    label: 'Cancelada',
    bgColor: '#F8FAFC',
    textColor: '#64748B',
    dotColor: '#94A3B8',
  },
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <View style={[styles.statusDot, { backgroundColor: config.dotColor }]} />
      <Text style={[styles.statusText, { color: config.textColor }]}>
        {config.label}
      </Text>
    </View>
  );
}

export function AppointmentCard({
  appointment,
  onPress,
  onCancel,
}: AppointmentCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isCancelled = appointment.status === 'cancelled';
  const isUpcoming = appointment.status === 'upcoming';

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(appointment);
  }, [appointment, onPress]);

  const handleCancel = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onCancel?.(appointment);
  }, [appointment, onCancel]);

  const formattedDate = formatSpanishDate(appointment.date);

  const cardStyle: ViewStyle = {
    ...styles.card,
    opacity: isCancelled ? 0.6 : 1,
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={cardStyle}
        accessibilityRole="button"
        accessibilityLabel={`Cita con ${appointment.doctorName} el ${formattedDate} a las ${appointment.time}`}
      >
        {/* Status bar accent */}
        <View
          style={[
            styles.statusAccent,
            {
              backgroundColor:
                STATUS_CONFIG[appointment.status].dotColor,
            },
          ]}
        />

        <View style={styles.content}>
          {/* Top row: doctor + status badge */}
          <View style={styles.topRow}>
            <View style={styles.doctorBlock}>
              <Text style={styles.doctorName} numberOfLines={1}>
                {appointment.doctorName}
              </Text>
              <Text style={styles.specialtyText} numberOfLines={1}>
                {appointment.specialty}
              </Text>
            </View>
            <StatusBadge status={appointment.status} />
          </View>

          {/* Info rows */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <Text style={styles.infoText}>{appointment.time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏥</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {appointment.hospital}
              </Text>
            </View>
          </View>

          {/* Footer row: copay + actions */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {appointment.copay != null && (
                <View style={styles.copayBadge}>
                  <Text style={styles.copayLabel}>Copago </Text>
                  <Text style={styles.copayAmount}>
                    {formatRD(appointment.copay)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.footerActions}>
              {isUpcoming && (
                <View style={styles.qrButton}>
                  <Text style={styles.qrButtonText}>Ver QR 📲</Text>
                </View>
              )}
              {isUpcoming && onCancel && (
                <Pressable
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar cita"
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statusAccent: {
    width: 4,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  doctorBlock: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  specialtyText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    gap: 6,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 13,
    width: 18,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 8,
  },
  footerLeft: {
    flex: 1,
  },
  copayBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  copayLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  copayAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qrButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
});
