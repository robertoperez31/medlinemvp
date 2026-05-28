import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SPECIALTIES } from '@/constants/specialties';

const INITIAL_VISIBLE = 6;

interface SpecialtyGridProps {
  onSelect: (specialtyId: string) => void;
  selectedId?: string;
}

interface CardProps {
  id: string;
  icon: string;
  name: string;
  isSelected: boolean;
  onPress: (id: string) => void;
}

function SpecialtyCard({ id, icon, name, isSelected, onPress }: CardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.94,
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
      bounciness: 5,
    }).start();
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  }, [id, onPress]);

  const containerStyle: ViewStyle = {
    ...styles.card,
    backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
    borderColor: isSelected ? '#4338CA' : '#E2E8F0',
    borderWidth: isSelected ? 2 : 1,
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={containerStyle}
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text
          style={[
            styles.name,
            isSelected ? styles.nameSelected : styles.nameNormal,
          ]}
          numberOfLines={2}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function SpecialtyGrid({ onSelect, selectedId }: SpecialtyGridProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleSpecialties = showAll
    ? SPECIALTIES
    : SPECIALTIES.slice(0, INITIAL_VISIBLE);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAll((prev) => !prev);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {visibleSpecialties.map((specialty) => (
          <SpecialtyCard
            key={specialty.id}
            id={specialty.id}
            icon={specialty.icon}
            name={specialty.name}
            isSelected={selectedId === specialty.id}
            onPress={onSelect}
          />
        ))}
      </View>

      {SPECIALTIES.length > INITIAL_VISIBLE && (
        <Pressable
          onPress={handleToggle}
          style={styles.toggleButton}
          accessibilityRole="button"
          accessibilityLabel={showAll ? 'Ver menos especialidades' : 'Ver todas las especialidades'}
        >
          <Text style={styles.toggleText}>
            {showAll
              ? '▲ Ver menos'
              : `Ver todas las especialidades (${SPECIALTIES.length - INITIAL_VISIBLE} más)`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cardWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  icon: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 6,
    textAlign: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  nameNormal: {
    color: '#0F172A',
  },
  nameSelected: {
    color: '#4338CA',
  },
  toggleButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
});
