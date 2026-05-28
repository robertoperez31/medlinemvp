import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  elevated?: boolean;
  padding?: Padding;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

const PADDING_MAP: Record<Padding, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

const elevatedShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
  default: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
}) as ViewStyle;

const flatShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  android: {
    elevation: 0,
  },
  default: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
}) as ViewStyle;

export function Card({
  elevated = false,
  padding = 'md',
  children,
  onPress,
  style,
}: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isInteractive = onPress != null;

  const handlePressIn = useCallback(() => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  }, [isInteractive, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (!isInteractive) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [isInteractive, scaleAnim]);

  const handlePress = useCallback(() => {
    if (!isInteractive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [isInteractive, onPress]);

  const containerStyle: ViewStyle = {
    ...styles.card,
    ...(elevated ? elevatedShadow : flatShadow),
    padding: PADDING_MAP[padding],
    ...style,
  };

  if (isInteractive) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          accessibilityRole="button"
          style={containerStyle}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
