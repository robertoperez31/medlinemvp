import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<Variant, { container: ViewStyle; text: TextStyle; indicator: string }> = {
  primary: {
    container: {
      backgroundColor: '#4338CA',
      borderWidth: 0,
    },
    text: {
      color: '#FFFFFF',
    },
    indicator: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#4338CA',
    },
    text: {
      color: '#4338CA',
    },
    indicator: '#4338CA',
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: {
      color: '#4338CA',
    },
    indicator: '#4338CA',
  },
  danger: {
    container: {
      backgroundColor: '#DC2626',
      borderWidth: 0,
    },
    text: {
      color: '#FFFFFF',
    },
    indicator: '#FFFFFF',
  },
};

const SIZE_STYLES: Record<Size, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
  sm: {
    container: {
      height: 36,
      paddingHorizontal: 16,
      minWidth: 44,
    },
    text: {
      fontSize: 14,
      lineHeight: 20,
    },
    iconSize: 16,
  },
  md: {
    container: {
      height: 44,
      paddingHorizontal: 24,
      minWidth: 44,
    },
    text: {
      fontSize: 16,
      lineHeight: 24,
    },
    iconSize: 18,
  },
  lg: {
    container: {
      height: 52,
      paddingHorizontal: 32,
      minWidth: 44,
    },
    text: {
      fontSize: 18,
      lineHeight: 28,
    },
    iconSize: 20,
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isInteractive = !disabled && !loading;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (!isInteractive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [isInteractive, onPress]);

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...variantStyle.container,
    ...sizeStyle.container,
    ...(fullWidth ? styles.fullWidth : {}),
    ...(disabled || loading ? styles.disabled : {}),
    ...style,
  };

  const textStyle: TextStyle = {
    ...styles.baseText,
    ...variantStyle.text,
    ...sizeStyle.text,
  };

  const opacityStyle: ViewStyle = disabled || loading ? { opacity: 0.5 } : { opacity: 1 };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth ? styles.fullWidthWrapper : styles.inlineWrapper,
        opacityStyle,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={!isInteractive}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isInteractive, busy: loading }}
        style={containerStyle}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyle.indicator}
            style={styles.activityIndicator}
          />
        ) : (
          <>
            {leftIcon != null && (
              <View style={styles.leftIconWrapper}>{leftIcon}</View>
            )}
            <Text style={textStyle}>{children}</Text>
            {rightIcon != null && (
              <View style={styles.rightIconWrapper}>{rightIcon}</View>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  baseText: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {},
  fullWidthWrapper: {
    width: '100%',
  },
  inlineWrapper: {
    alignSelf: 'flex-start',
  },
  leftIconWrapper: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIconWrapper: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicator: {
    marginVertical: 2,
  },
});
