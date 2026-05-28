import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { MedicalCondition, ConditionStatus } from '@/types/medical';

interface ConditionCardProps {
  condition: MedicalCondition;
  onEdit: (condition: MedicalCondition) => void;
  onDelete: (conditionId: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 60;
const DELETE_WIDTH = 80;

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<ConditionStatus, StatusConfig> = {
  activa: {
    label: 'Activa',
    bgColor: '#ECFDF5',
    textColor: '#059669',
  },
  inactiva: {
    label: 'Inactiva',
    bgColor: '#F8FAFC',
    textColor: '#64748B',
  },
};

export function ConditionCard({ condition, onEdit, onDelete }: ConditionCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

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
    onEdit(condition);
  }, [condition, onEdit, closeSwipe]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Eliminar condición',
      `¿Estás seguro de que deseas eliminar "${condition.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: closeSwipe },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDelete(condition.id);
          },
        },
      ],
    );
  }, [condition, onDelete, closeSwipe]);

  const statusConfig = STATUS_CONFIG[condition.status];

  return (
    <View style={styles.wrapper}>
      {/* Delete button revealed on swipe */}
      <View style={styles.deleteButtonContainer}>
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${condition.name}`}
        >
          <Text style={styles.deleteIcon}>🗑</Text>
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>

      {/* Swipeable card */}
      <Animated.View
        style={[styles.card, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={handlePress}
          style={styles.cardContent}
          accessibilityRole="button"
          accessibilityLabel={`Condición: ${condition.name}, estado ${condition.status}`}
        >
          {/* Left accent by status */}
          <View
            style={[
              styles.leftAccent,
              {
                backgroundColor:
                  condition.status === 'activa' ? '#059669' : '#CBD5E1',
              },
            ]}
          />

          <View style={styles.mainContent}>
            {/* Top row: name + status badge */}
            <View style={styles.topRow}>
              <Text style={styles.conditionName} numberOfLines={1}>
                {condition.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bgColor },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusConfig.textColor },
                  ]}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.textColor }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            {/* Diagnosis year */}
            {condition.diagnosisYear ? (
              <Text style={styles.metaText}>
                Diagnosticado en {condition.diagnosisYear}
              </Text>
            ) : null}

            {/* Notes preview */}
            {condition.notes ? (
              <Text style={styles.notesText} numberOfLines={2}>
                {condition.notes}
              </Text>
            ) : null}
          </View>

          {/* Edit chevron */}
          <Text style={styles.editChevron}>›</Text>
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  leftAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 0,
    minHeight: 60,
  },
  mainContent: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  conditionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
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
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  editChevron: {
    fontSize: 22,
    color: '#CBD5E1',
    paddingRight: 12,
    paddingLeft: 4,
  },
});
