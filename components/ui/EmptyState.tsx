import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const hasAction = actionLabel != null && actionLabel.length > 0 && onAction != null;

  return (
    <View style={styles.container} accessibilityRole="none">
      <View style={styles.iconWrapper} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>

      {description != null && description.length > 0 && (
        <Text style={styles.description}>{description}</Text>
      )}

      {hasAction && (
        <View style={styles.actionWrapper}>
          <Button variant="primary" size="md" onPress={onAction}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 48,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  actionWrapper: {
    marginTop: 24,
    alignItems: 'center',
  },
});
