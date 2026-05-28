import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  PanResponder,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Allergy, AllergySeverity } from '@/types/medical';

interface AllergyCardProps {
  allergy: Allergy;
  onEdit: (allergy: Allergy) => void;
  onDelete: (allergyId: number) => void;
}

const DELETE_WIDTH = 80;
const SWIPE_THRESHOLD = 60;

interface SeverityConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
}

const SEVERITY_CONFIG: Record<AllergySeverity, SeverityConfig> = {
  alta: {
    label: 'Alta',
    bgColor: '#FEF2F2',
    textColor: '#DC2626',
    borderColor: '#DC2626',
    icon: '🔴',
  },
  moderada: {
    label: 'Moderada',
    bgColor: '#FFFBEB',
    textColor: '#D97706',
    borderColor: '#D97706',
    icon: '🟡',
  },
  baja: {
    label: 'Baja',
    bgColor: '#ECFDF5',
    textColor: '#059669',
    borderColor: '#059669',
    icon: '🟢',
  },
};

export function AllergyCard({ allergy, onEdit, onDelete }: AllergyCardProps) {
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
    onEdit(allergy);
  }, [allergy, onEdit, closeSwipe]);

  const handleDelete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Eliminar alergia',
      `¿Estás seguro de que deseas eliminar la alergia a "${allergy.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: closeSwipe },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDelete(allergy.id);
          },
        },
      ],
    );
  }, [allergy, onDelete, closeSwipe]);

  const severityConfig = SEVERITY_CONFIG[allergy.severity];

  return (
    <View style={styles.wrapper}>
      {/* Delete button revealed on swipe */}
      <View style={styles.deleteButtonContainer}>
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar alergia a ${allergy.name}`}
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
          accessibilityLabel={`Alergia a ${allergy.name}, severidad ${allergy.severity}`}
        >
          {/* Colored left border by severity */}
          <View
            style={[
              styles.leftBorder,
              { backgroundColor: severityConfig.borderColor },
            ]}
          />

          {/* Content */}
          <View style={styles.mainContent}>
            <View style={styles.topRow}>
              {/* Allergy name */}
              <View style={styles.nameBlock}>
                <Text style={styles.allergyName} numberOfLines={1}>
                  {severityConfig.icon} {allergy.name}
                </Text>
              </View>

              {/* Severity badge */}
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: severityConfig.bgColor },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    { color: severityConfig.textColor },
                  ]}
                >
                  {severityConfig.label}
                </Text>
              </View>
            </View>

            {/* Severity descriptor */}
            <Text
              style={[
                styles.severityDescriptor,
                { color: severityConfig.textColor },
              ]}
            >
              Severidad {allergy.severity}
            </Text>

            {/* Reaction text */}
            {allergy.reaction ? (
              <View style={styles.reactionBlock}>
                <Text style={styles.reactionLabel}>Reacción: </Text>
                <Text style={styles.reactionText} numberOfLines={2}>
                  {allergy.reaction}
                </Text>
              </View>
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
  },
  leftBorder: {
    width: 4,
    alignSelf: 'stretch',
    minHeight: 60,
    flexShrink: 0,
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
    marginBottom: 3,
    gap: 8,
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  allergyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  severityBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexShrink: 0,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  severityDescriptor: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  reactionBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  reactionLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  reactionText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  editChevron: {
    fontSize: 22,
    color: '#CBD5E1',
    paddingRight: 12,
    paddingLeft: 4,
  },
});
