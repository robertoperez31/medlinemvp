import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '@/types/appointment';

interface QRPassProps {
  appointment: Appointment;
  onClose: () => void;
}

function formatRD(amount: number): string {
  return `RD$ ${amount.toLocaleString('es-DO')}`;
}

function formatSpanishDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const formatted = format(date, "EEEE d 'de' MMMM yyyy", { locale: es });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

function buildQRPayload(appointment: Appointment): string {
  const payload = {
    id: appointment.id,
    confirmation: appointment.confirmationNumber ?? appointment.id,
    doctor: appointment.doctorName,
    specialty: appointment.specialty,
    hospital: appointment.hospital,
    date: appointment.date,
    time: appointment.time,
    copay: appointment.copay,
  };
  return JSON.stringify(payload);
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}

function InfoRow({ icon, label, value, accent = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, accent && styles.infoValueAccent]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function QRPass({ appointment, onClose }: QRPassProps) {
  const qrPayload = buildQRPayload(appointment);
  const formattedDate = formatSpanishDate(appointment.date);
  const confirmationNum = appointment.confirmationNumber ?? appointment.id.slice(-8).toUpperCase();

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const message = [
      '📋 Cita médica - InstaSalud',
      `Confirmación: #${confirmationNum}`,
      `Doctor: ${appointment.doctorName}`,
      `Especialidad: ${appointment.specialty}`,
      `Hospital: ${appointment.hospital}`,
      `Fecha: ${formattedDate}`,
      `Hora: ${appointment.time}`,
      appointment.copay != null
        ? `Copago: ${formatRD(appointment.copay)}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message }
          : { message, title: 'Mi cita médica - InstaSalud' },
      );
    } catch {
      // Share cancelled or failed, do nothing
    }
  }, [appointment, confirmationNum, formattedDate]);

  const handleSave = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Pase guardado',
      'Tu pase de cita ha sido guardado en tu galería.',
      [{ text: 'OK' }],
    );
  }, []);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  return (
    <View style={styles.container}>
      {/* Decorative purple layers */}
      <View style={styles.bgLayer1} />
      <View style={styles.bgLayer2} />
      <View style={styles.bgLayer3} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Cerrar pase"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>

        {/* Logo + confirmation */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Insta</Text>
            <Text style={styles.logoTextAccent}>Salud</Text>
          </View>
          <Text style={styles.passLabel}>PASE DE CITA MÉDICA</Text>
          <Text style={styles.confirmationNumber}>#{confirmationNum}</Text>
        </View>

        {/* QR Card */}
        <View style={styles.qrCard}>
          {/* Top ticket notch simulation */}
          <View style={styles.ticketRowTop}>
            <View style={styles.notchLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchRight} />
          </View>

          {/* QR code area */}
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrPayload}
                size={200}
                color="#0F172A"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.qrHintText}>
              Muestra este código al llegar al hospital
            </Text>
          </View>

          {/* Divider with tear effect */}
          <View style={styles.ticketRowBottom}>
            <View style={styles.notchLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchRight} />
          </View>

          {/* Appointment details */}
          <View style={styles.detailsSection}>
            <InfoRow
              icon="👨‍⚕️"
              label="Doctor"
              value={appointment.doctorName}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="🩺"
              label="Especialidad"
              value={appointment.specialty}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="🏥"
              label="Hospital"
              value={appointment.hospital}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="📅"
              label="Fecha"
              value={formattedDate}
            />
            <View style={styles.divider} />
            <InfoRow
              icon="🕐"
              label="Hora"
              value={appointment.time}
            />
            {appointment.copay != null && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  icon="💳"
                  label="Copago"
                  value={formatRD(appointment.copay)}
                  accent
                />
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleShare}
            style={[styles.actionButton, styles.actionButtonShare]}
            accessibilityRole="button"
            accessibilityLabel="Compartir pase"
          >
            <Text style={styles.actionButtonShareIcon}>↑</Text>
            <Text style={styles.actionButtonShareText}>Compartir</Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            style={[styles.actionButton, styles.actionButtonSave]}
            accessibilityRole="button"
            accessibilityLabel="Guardar pase"
          >
            <Text style={styles.actionButtonSaveIcon}>⬇</Text>
            <Text style={styles.actionButtonSaveText}>Guardar</Text>
          </Pressable>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Presenta este pase al llegar. Válido únicamente para la fecha y hora indicadas.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4338CA',
    position: 'relative',
  },
  bgLayer1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#5B52D9',
    opacity: 0.5,
  },
  bgLayer2: {
    position: 'absolute',
    bottom: 80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#3730A3',
    opacity: 0.4,
  },
  bgLayer3: {
    position: 'absolute',
    top: '30%',
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#6366F1',
    opacity: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoTextAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  passLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmationNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  ticketRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 0,
    overflow: 'visible',
  },
  ticketRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 0,
    overflow: 'visible',
    marginTop: -1,
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4338CA',
    marginLeft: -10,
    zIndex: 1,
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4338CA',
    marginRight: -10,
    zIndex: 1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  qrSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  qrHintText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  detailsSection: {
    padding: 20,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoIcon: {
    fontSize: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoValueAccent: {
    color: '#4338CA',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 44,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonShare: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonSave: {
    backgroundColor: '#FFFFFF',
  },
  actionButtonShareIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButtonShareText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonSaveIcon: {
    fontSize: 16,
    color: '#4338CA',
    fontWeight: '700',
  },
  actionButtonSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4338CA',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
