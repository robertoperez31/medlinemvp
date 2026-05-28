import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeSlotPickerProps {
  slots: string[];
  selected: string | undefined;
  onSelect: (time: string) => void;
  date: Date;
  isLoading: boolean;
}

interface SlotGroup {
  label: string;
  emoji: string;
  times: string[];
}

function parseHour(time: string): number {
  const [hourStr, minuteStr] = time.split(':');
  return parseInt(hourStr, 10);
}

function groupSlots(slots: string[]): SlotGroup[] {
  const manana: string[] = [];
  const tarde: string[] = [];
  const noche: string[] = [];

  for (const slot of slots) {
    const hour = parseHour(slot);
    if (hour < 12) {
      manana.push(slot);
    } else if (hour < 18) {
      tarde.push(slot);
    } else {
      noche.push(slot);
    }
  }

  const groups: SlotGroup[] = [];
  if (manana.length > 0) {
    groups.push({ label: 'Mañana', emoji: '🌅', times: manana });
  }
  if (tarde.length > 0) {
    groups.push({ label: 'Tarde', emoji: '☀️', times: tarde });
  }
  if (noche.length > 0) {
    groups.push({ label: 'Noche', emoji: '🌙', times: noche });
  }
  return groups;
}

function SkeletonBlock({ width, height }: { width: number | string; height: number }) {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, opacity },
      ]}
    />
  );
}

function SkeletonGroup() {
  return (
    <View style={styles.groupSection}>
      <SkeletonBlock width={80} height={16} />
      <View style={styles.slotsRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} width={60} height={38} />
        ))}
      </View>
    </View>
  );
}

interface SlotButtonProps {
  time: string;
  isSelected: boolean;
  onPress: (time: string) => void;
}

function SlotButton({ time, isSelected, onPress }: SlotButtonProps) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(time);
  }, [time, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.slotBtn,
        isSelected ? styles.slotBtnSelected : styles.slotBtnNormal,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Hora ${time}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          styles.slotText,
          isSelected ? styles.slotTextSelected : styles.slotTextNormal,
        ]}
      >
        {time}
      </Text>
    </Pressable>
  );
}

export function TimeSlotPicker({
  slots,
  selected,
  onSelect,
  date,
  isLoading,
}: TimeSlotPickerProps) {
  const dateLabel = useMemo(() => {
    try {
      return format(date, "EEEE d 'de' MMMM", { locale: es });
    } catch {
      return '';
    }
  }, [date]);

  const capitalizedDate = useMemo(() => {
    if (!dateLabel) return '';
    return dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
  }, [dateLabel]);

  const groups = useMemo(() => groupSlots(slots), [slots]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <SkeletonBlock width={160} height={18} />
        </View>
        <SkeletonGroup />
        <SkeletonGroup />
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateLabel}>{capitalizedDate}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>Sin horarios disponibles</Text>
          <Text style={styles.emptySubtitle}>
            No hay citas disponibles para este día. Selecciona otra fecha.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>{capitalizedDate}</Text>
        <Text style={styles.slotCount}>
          {slots.length} {slots.length === 1 ? 'horario' : 'horarios'}
        </Text>
      </View>

      {groups.map((group) => (
        <View key={group.label} style={styles.groupSection}>
          <Text style={styles.groupLabel}>
            {group.emoji} {group.label} ({group.times.length})
          </Text>
          <View style={styles.slotsRow}>
            {group.times.map((time) => (
              <SlotButton
                key={time}
                time={time}
                isSelected={selected === time}
                onPress={onSelect}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  slotCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  groupSection: {
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotBtn: {
    minWidth: 60,
    minHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  slotBtnNormal: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotBtnSelected: {
    backgroundColor: '#4338CA',
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  slotTextNormal: {
    color: '#0F172A',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  skeleton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
