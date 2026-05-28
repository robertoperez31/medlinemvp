import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Skeleton } from '@/components/ui/Skeleton';
import type { InsuranceVerificationResult } from '@/types/appointment';

interface InsuranceVerificationProps {
  result: InsuranceVerificationResult | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function formatRD(amount: number): string {
  return `RD$ ${amount.toLocaleString('es-DO')}`;
}

function TableRow({
  label,
  value,
  valueStyle,
  isHighlight,
}: {
  label: string;
  value: string;
  valueStyle?: ViewStyle;
  isHighlight?: boolean;
}) {
  return (
    <View style={[styles.tableRow, isHighlight && styles.tableRowHighlight]}>
      <Text style={[styles.tableLabel, isHighlight && styles.tableLabelHighlight]}>
        {label}
      </Text>
      <Text style={[styles.tableValue, isHighlight && styles.tableValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.loadingHeaderText}>
          <Skeleton width={160} height={16} borderRadius={6} />
          <View style={{ marginTop: 6 }}>
            <Skeleton width={100} height={12} borderRadius={6} />
          </View>
        </View>
      </View>
      <View style={styles.loadingRows}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.loadingRow}>
            <Skeleton width={120} height={14} borderRadius={6} />
            <Skeleton width={80} height={14} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const handleRetry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRetry?.();
  }, [onRetry]);

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconCircle}>
        <Text style={styles.errorIcon}>✕</Text>
      </View>
      <Text style={styles.errorTitle}>Error de verificación</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={handleRetry}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Reintentar verificación"
        >
          <Text style={styles.retryButtonText}>↺ Reintentar</Text>
        </Pressable>
      )}
    </View>
  );
}

function SuccessState({ result }: { result: InsuranceVerificationResult }) {
  return (
    <View style={styles.successContainer}>
      {/* Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIconCircle}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <View style={styles.successHeaderText}>
          <Text style={styles.successTitle}>Seguro verificado</Text>
          <Text style={styles.successSubtitle}>
            {result.arsName} · {result.planName}
          </Text>
        </View>
      </View>

      {/* Best coverage badge */}
      {result.isBestCoverage && (
        <View style={styles.bestCoverageBadge}>
          <Text style={styles.bestCoverageText}>
            ✓ Mejor cobertura para esta especialidad
          </Text>
        </View>
      )}

      {/* Table */}
      <View style={styles.table}>
        <TableRow
          label="Número de afiliado"
          value={result.affiliateNumber}
        />
        <View style={styles.tableDivider} />
        <TableRow
          label="Cobertura"
          value={`${result.coveragePercent}%`}
        />
        <View style={styles.tableDivider} />
        <TableRow
          label="Costo total"
          value={formatRD(result.totalCost)}
        />
        <View style={styles.tableDivider} />
        <TableRow
          label="Tu copago"
          value={formatRD(result.copay)}
          isHighlight
        />
      </View>

      {/* Savings note */}
      {result.coveragePercent > 0 && (
        <View style={styles.savingsNote}>
          <Text style={styles.savingsNoteText}>
            💰 Tu seguro cubre{' '}
            <Text style={styles.savingsAmount}>
              {formatRD(result.totalCost - result.copay)}
            </Text>{' '}
            de esta consulta
          </Text>
        </View>
      )}
    </View>
  );
}

export function InsuranceVerification({
  result,
  isLoading,
  error,
  onRetry,
}: InsuranceVerificationProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!result) {
    return null;
  }

  return <SuccessState result={result} />;
}

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  loadingHeaderText: {
    flex: 1,
  },
  loadingRows: {
    gap: 16,
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Error
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 20,
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 20,
    color: '#DC2626',
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Success
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    overflow: 'hidden',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    gap: 12,
  },
  successIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  successIcon: {
    fontSize: 20,
    color: '#059669',
    fontWeight: '700',
  },
  successHeaderText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#059669',
    marginTop: 2,
  },
  bestCoverageBadge: {
    backgroundColor: '#F0FDFA',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bestCoverageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
    textAlign: 'center',
  },
  table: {
    padding: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  tableRowHighlight: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  tableLabel: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  tableLabelHighlight: {
    color: '#4338CA',
    fontWeight: '600',
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  tableValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4338CA',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  savingsNote: {
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    alignItems: 'center',
  },
  savingsNoteText: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
  savingsAmount: {
    fontWeight: '700',
    color: '#D97706',
  },
});
