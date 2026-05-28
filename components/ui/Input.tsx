import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';

interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  accessibilityLabel?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  accessibilityLabel,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const hasError = error != null && error.length > 0;
  const isDisabled = !editable;

  const borderColor = hasError
    ? '#DC2626'
    : isFocused
    ? '#4338CA'
    : '#E2E8F0';

  const containerStyle: ViewStyle = {
    ...styles.inputContainer,
    borderColor,
    ...(isDisabled ? styles.disabledContainer : {}),
    ...(multiline ? styles.multilineContainer : {}),
  };

  const inputStyle: TextStyle = {
    ...styles.input,
    ...(isDisabled ? styles.disabledText : {}),
    ...(multiline ? styles.multilineInput : {}),
  };

  const textAlignVertical: 'top' | 'center' = multiline ? 'top' : 'center';

  return (
    <View style={styles.wrapper}>
      {label != null && label.length > 0 && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}

      <View style={containerStyle}>
        {leftIcon != null && (
          <View style={styles.leftIconWrapper} pointerEvents="none">
            {leftIcon}
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          textAlignVertical={textAlignVertical}
          style={inputStyle}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={helperText}
          accessibilityState={{ disabled: isDisabled }}
          underlineColorAndroid="transparent"
        />

        {rightIcon != null && (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        )}
      </View>

      {hasError && (
        <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {!hasError && helperText != null && helperText.length > 0 && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  disabledContainer: {
    backgroundColor: '#F8FAFC',
  },
  leftIconWrapper: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rightIconWrapper: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  multilineInput: {
    minHeight: 80,
  },
  disabledText: {
    color: '#94A3B8',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontWeight: '400',
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '400',
  },
});
