import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Switch,
  PanResponder,
  Alert,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Medication } from '@/types/medical';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medicationId: number) => void;
}

const DELETE_WIDTH = 80;
const SWIPE_THRESHOLD = 60;

function formatStartDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    const formatted = format(date, "d 'de' MMMM yyyy", { locale: es });
    return `Desde el ${formatted}`;
  } catch {
    return null;
  }
}

export function MedicationCard({
  medication,
  onEdit,
  onDelete,
}: MedicationCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const [isActive, setIsActive] = useState(medication.active ?? true);

  const closeSwipe = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start(() => {
      isOpen.current = false;
    });
  }, [translateX]);

  const openSwipe = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(translateX, {
      toValue: -DELETE_WIDTH,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start(() => {
      isOpen.current = true;
    });
  }, [translateX]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = isOpen.current
          ? Math.min(0, -DELETE_WIDTH + gestureState.dx)
          : Math.min(0, gestureState.dx);
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentVal = isOpen.current
          ? -DELETE_WIDTH + gestureState.dx
          : gestureState.dx;

        if (currentVal < -SWIPE_THRESHOLD) {
          openSwipe();
        } else {
          closeSwipe();
        }
      },
      onPanResponderTerminate: () => {
        closeSwipe();
      },
    }),
  ).current;

  const handlePress = useCallback(() => {
    if (isOpen.current) {
      closeSwipe();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit(medication);
  }, [medication, onEdit, closeSwipe]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Eliminar medicamento',
      `¿Estás seguro de que deseas eliminar "${medication.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: closeSwipe },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDelete(medication.id);
          },
        },
      ],
    );
  }, [medication, onDelete, closeSwipe]);

  const handleToggleActive = useCallback(
    (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsActive(value);
    },
    [],
  );

  const startDateLabel = formatStartDate(medication.startDate);
  const dosageLabel =
    medication.dosage
      ? `${medication.dosage} · ${medication.frequency}`
      : medication.frequency;

  return (
    <View style={styles.wrapper}>
      {/* Delete button revealed on swipe */}
      <View style={styles.deleteButtonContainer}>
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${medication.name}`}
        >
          <Text style={styles.deleteIcon}>🗑</Text>
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={[
          styles.card,
          !isActive && styles.cardInactive,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={handlePress}
          style={styles.cardContent}
          accessibilityRole="button"
          accessibilityLabel={`Medicamento: ${medication.name}, ${dosageLabel}`}
        >
          {/* Pill icon */}
          <View style={[styles.iconContainer, !isActive && styles.iconContainerInactive]}>
            <Text style={styles.pillIcon}>💊</Text>
          </View>

          {/* Main info */}
          <View style={styles.mainContent}>
            <View style={styles.topRow}>
              <Text
                style={[styles.medicationName, !isActive && styles.medicationNameInactive]}
                numberOfLines={1}
              >
                {medication.name}
              </Text>
            </View>

            <Text style={styles.dosageText} numberOfLines={1}>
              {dosageLabel}
            </Text>

            {startDateLabel && (
              <Text style={styles.startDateText}>{startDateLabel}</Text>
            )}

            {medication.instructions ? (
              <Text style={styles.instructionsText} numberOfLines={2}>
                {medication.instructions}
              </Text>
            ) : null}
          </View>

          {/* Active toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {isActive ? 'Activo' : 'Inactivo'}
            </Text>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
              thumbColor={isActive ? '#4338CA' : '#94A3B8'}
              ios_backgroundColor="#E2E8F0"
              accessibilityLabel={`${medication.name} ${isActive ? 'activo' : 'inactivo'}`}
            />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
    position: 'relative',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
  },
  deleteIcon: {
    fontSize: 18,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInactive: {
    opacity: 0.7,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerInactive: {
    backgroundColor: '#F1F5F9',
  },
  pillIcon: {
    fontSize: 22,
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  medicationNameInactive: {
    color: '#94A3B8',
  },
  dosageText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '500',
    marginBottom: 2,
  },
  startDateText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 2,
  },
  toggleContainer: {
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  toggleLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
