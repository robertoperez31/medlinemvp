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
import type { Doctor } from '@/types/doctor';
import type { WaitTimePrediction } from '@/types/appointment';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
  selected: boolean;
  waitPrediction?: WaitTimePrediction;
}

function formatPrice(amount: number): string {
  return `RD$ ${amount.toLocaleString('es-DO')}`;
}

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: full }).map((_, i) => (
        <Text key={`f-${i}`} style={styles.starFull}>★</Text>
      ))}
      {hasHalf && <Text style={styles.starHalf}>★</Text>}
      {Array.from({ length: empty }).map((_, i) => (
        <Text key={`e-${i}`} style={styles.starEmpty}>★</Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function WaitBadge({ prediction }: { prediction: WaitTimePrediction }) {
  const bgColor =
    prediction.label === 'Espera mínima'
      ? '#ECFDF5'
      : prediction.label === 'Espera moderada'
      ? '#FFFBEB'
      : '#FEF2F2';

  const textColor =
    prediction.label === 'Espera mínima'
      ? '#059669'
      : prediction.label === 'Espera moderada'
      ? '#D97706'
      : '#DC2626';

  return (
    <View style={[styles.waitBadge, { backgroundColor: bgColor }]}>
      <Text style={[styles.waitBadgeText, { color: textColor }]}>
        ⏱ {prediction.minutes} min
      </Text>
    </View>
  );
}

export function DoctorCard({
  doctor,
  onSelect,
  selected,
  waitPrediction,
}: DoctorCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

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
    onSelect(doctor);
  }, [doctor, onSelect]);

  const cardStyle: ViewStyle = {
    ...styles.card,
    borderColor: selected ? '#4338CA' : '#E2E8F0',
    borderWidth: selected ? 2 : 1,
    backgroundColor: selected ? '#FAFBFF' : '#FFFFFF',
  };

  const showLanguages = doctor.languages && doctor.languages.length > 1;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={cardStyle}
        accessibilityRole="button"
        accessibilityLabel={`Dr. ${doctor.name}, ${doctor.specialty}`}
        accessibilityState={{ selected }}
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
          </View>

          <View style={styles.infoBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.doctorName} numberOfLines={1}>
                {doctor.name}
              </Text>
              {selected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.specialtyText} numberOfLines={1}>
              {doctor.specialty}
            </Text>
            <Text style={styles.hospitalText} numberOfLines={1}>
              📍 {doctor.hospital}
            </Text>
          </View>
        </View>

        {/* Rating & Price row */}
        <View style={styles.metaRow}>
          <RatingStars rating={doctor.rating} />
          <Text style={styles.reviewCount}>({doctor.reviewCount})</Text>
          <View style={styles.spacer} />
          <Text style={styles.price}>{formatPrice(doctor.pricePerConsult)}</Text>
        </View>

        {/* Badges row */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.availBadge,
              {
                backgroundColor: doctor.availableToday ? '#ECFDF5' : '#F1F5F9',
              },
            ]}
          >
            <Text
              style={[
                styles.availBadgeText,
                { color: doctor.availableToday ? '#059669' : '#64748B' },
              ]}
            >
              {doctor.availableToday ? '● Disponible hoy' : '○ No disponible hoy'}
            </Text>
          </View>

          {waitPrediction && <WaitBadge prediction={waitPrediction} />}
        </View>

        {/* Languages */}
        {showLanguages && (
          <View style={styles.languagesRow}>
            {doctor.languages.map((lang) => (
              <View key={lang} style={styles.langChip}>
                <Text style={styles.langChipText}>{lang}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  infoBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  specialtyText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '600',
    marginTop: 2,
  },
  hospitalText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starFull: {
    fontSize: 13,
    color: '#F59E0B',
  },
  starHalf: {
    fontSize: 13,
    color: '#FCD34D',
  },
  starEmpty: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  ratingText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 3,
  },
  spacer: {
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  availBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  availBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  waitBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  waitBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  languagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  langChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  langChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
});
