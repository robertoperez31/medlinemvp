import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Variant = 'teal' | 'indigo' | 'red' | 'amber' | 'gray' | 'green';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: Variant;
  size?: BadgeSize;
  children: React.ReactNode;
}

interface VariantStyle {
  container: ViewStyle;
  text: TextStyle;
}

const VARIANT_STYLES: Record<Variant, VariantStyle> = {
  teal: {
    container: { backgroundColor: '#F0FDFA' },
    text: { color: '#0F766E' },
  },
  indigo: {
    container: { backgroundColor: '#EEF2FF' },
    text: { color: '#4338CA' },
  },
  red: {
    container: { backgroundColor: '#FEF2F2' },
    text: { color: '#DC2626' },
  },
  amber: {
    container: { backgroundColor: '#FFFBEB' },
    text: { color: '#D97706' },
  },
  gray: {
    container: { backgroundColor: '#F8FAFC' },
    text: { color: '#64748B' },
  },
  green: {
    container: { backgroundColor: '#ECFDF5' },
    text: { color: '#059669' },
  },
};

const SIZE_STYLES: Record<BadgeSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    text: {
      fontSize: 11,
      lineHeight: 16,
    },
  },
  md: {
    container: {
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    text: {
      fontSize: 13,
      lineHeight: 18,
    },
  },
};

export function Badge({ variant = 'gray', size = 'md', children }: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...variantStyle.container,
    ...sizeStyle.container,
  };

  const textStyle: TextStyle = {
    ...styles.baseText,
    ...variantStyle.text,
    ...sizeStyle.text,
  };

  return (
    <View style={containerStyle}>
      <Text style={textStyle} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
