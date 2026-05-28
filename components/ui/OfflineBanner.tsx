import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, ViewStyle } from 'react-native';

interface OfflineBannerProps {
  visible: boolean;
  pendingCount?: number;
}

const BANNER_HEIGHT = 44;

export function OfflineBanner({ visible, pendingCount = 0 }: OfflineBannerProps) {
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -BANNER_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  const pendingText =
    pendingCount > 0
      ? `${pendingCount} ${pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}`
      : 'Sin cambios pendientes';

  const bannerStyle: ViewStyle = {
    ...styles.banner,
    transform: [{ translateY }],
  };

  return (
    <Animated.View
      style={bannerStyle}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Sin conexión. ${pendingText}.`}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Text style={styles.wifiIcon} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        📵
      </Text>
      <Text style={styles.text} numberOfLines={1}>
        Sin conexión
        {pendingCount > 0 ? ` • ${pendingCount} ${pendingCount === 1 ? 'cambio pendiente' : 'cambios pendientes'}` : ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  wifiIcon: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 0.1,
  },
});
