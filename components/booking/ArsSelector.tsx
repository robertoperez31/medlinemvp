import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ARS_PROVIDERS } from '@/constants/arsProviders';
import type { ARSProvider, ARSPlan } from '@/types/insurance';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ArsSelectorProps {
  onSelect: (arsId: string, planId: string) => void;
  selectedArsId?: string;
  selectedPlanId?: string;
}

interface PlanRowProps {
  plan: ARSPlan;
  isSelected: boolean;
  onPress: (planId: string) => void;
}

function PlanRow({ plan, isSelected, onPress }: PlanRowProps) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(plan.id);
  }, [plan.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.planRow, isSelected && styles.planRowSelected]}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`Plan ${plan.name}, ${plan.coveragePercent}% de cobertura`}
    >
      <View style={styles.planInfo}>
        <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
          {plan.name}
        </Text>
        <Text style={styles.planCoverage}>
          {plan.coveragePercent}% cobertura
        </Text>
      </View>
      <View style={styles.planRight}>
        <View style={[styles.coveragePill, { backgroundColor: getCoverageColor(plan.coveragePercent).bg }]}>
          <Text style={[styles.coveragePillText, { color: getCoverageColor(plan.coveragePercent).text }]}>
            {plan.coveragePercent}%
          </Text>
        </View>
        {isSelected ? (
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        ) : (
          <View style={styles.uncheckCircle} />
        )}
      </View>
    </Pressable>
  );
}

function getCoverageColor(percent: number): { bg: string; text: string } {
  if (percent >= 90) return { bg: '#ECFDF5', text: '#059669' };
  if (percent >= 75) return { bg: '#EEF2FF', text: '#4338CA' };
  if (percent >= 60) return { bg: '#FFFBEB', text: '#D97706' };
  return { bg: '#F1F5F9', text: '#64748B' };
}

interface ArsRowProps {
  provider: ARSProvider;
  isExpanded: boolean;
  selectedPlanId?: string;
  onToggle: (arsId: string) => void;
  onPlanSelect: (arsId: string, planId: string) => void;
}

function ArsRow({ provider, isExpanded, selectedPlanId, onToggle, onPlanSelect }: ArsRowProps) {
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onToggle(provider.id);
  }, [provider.id, isExpanded, onToggle, rotateAnim]);

  const handlePlanSelect = useCallback(
    (planId: string) => {
      onPlanSelect(provider.id, planId);
    },
    [provider.id, onPlanSelect],
  );

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const selectedPlan = provider.plans.find((p) => p.id === selectedPlanId);
  const hasSelectedPlan = !!selectedPlan;

  return (
    <View style={[styles.arsCard, isExpanded && styles.arsCardExpanded]}>
      <Pressable
        onPress={handleToggle}
        style={styles.arsHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${provider.name}, ${provider.plans.length} planes disponibles`}
      >
        <View style={styles.arsHeaderLeft}>
          <View style={[styles.arsColorDot, { backgroundColor: provider.color }]} />
          <View style={styles.arsNameBlock}>
            <Text style={styles.arsName}>{provider.name}</Text>
            {hasSelectedPlan && !isExpanded && (
              <Text style={styles.arsSelectedPlanLabel}>
                Plan {selectedPlan.name} · {selectedPlan.coveragePercent}%
              </Text>
            )}
            {!hasSelectedPlan && (
              <Text style={styles.arsPlanCount}>
                {provider.plans.length} {provider.plans.length === 1 ? 'plan' : 'planes'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.arsHeaderRight}>
          {hasSelectedPlan && (
            <View style={styles.arsSelectedIndicator}>
              <Text style={styles.arsSelectedIndicatorText}>✓</Text>
            </View>
          )}
          <Animated.Text
            style={[styles.chevron, { transform: [{ rotate: chevronRotation }] }]}
          >
            ▼
          </Animated.Text>
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.plansList}>
          <View style={styles.plansDivider} />
          {provider.plans.map((plan) => (
            <PlanRow
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              onPress={handlePlanSelect}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export function ArsSelector({ onSelect, selectedArsId, selectedPlanId }: ArsSelectorProps) {
  const [expandedArsId, setExpandedArsId] = useState<string | null>(
    selectedArsId ?? null,
  );

  const handleToggle = useCallback((arsId: string) => {
    setExpandedArsId((prev) => (prev === arsId ? null : arsId));
  }, []);

  const handlePlanSelect = useCallback(
    (arsId: string, planId: string) => {
      onSelect(arsId, planId);
    },
    [onSelect],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Selecciona tu ARS</Text>
        <Text style={styles.headerSubtitle}>
          Elige tu aseguradora y plan de salud
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {ARS_PROVIDERS.map((provider) => (
          <ArsRow
            key={provider.id}
            provider={provider}
            isExpanded={expandedArsId === provider.id}
            selectedPlanId={
              selectedArsId === provider.id ? selectedPlanId : undefined
            }
            onToggle={handleToggle}
            onPlanSelect={handlePlanSelect}
          />
        ))}
      </ScrollView>

      {selectedArsId && selectedPlanId && (
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionSummaryText}>
            {ARS_PROVIDERS.find((a) => a.id === selectedArsId)?.name}
            {' · '}
            Plan{' '}
            {ARS_PROVIDERS.find((a) => a.id === selectedArsId)?.plans.find(
              (p) => p.id === selectedPlanId,
            )?.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
    paddingBottom: 24,
  },
  arsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  arsCardExpanded: {
    borderColor: '#C7D2FE',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  arsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  arsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arsColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    flexShrink: 0,
  },
  arsNameBlock: {
    flex: 1,
  },
  arsName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  arsSelectedPlanLabel: {
    fontSize: 12,
    color: '#4338CA',
    fontWeight: '600',
    marginTop: 2,
  },
  arsPlanCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  arsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arsSelectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arsSelectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  plansDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
    marginBottom: 4,
  },
  plansList: {
    paddingBottom: 6,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  planRowSelected: {
    backgroundColor: '#EEF2FF',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  planNameSelected: {
    color: '#4338CA',
  },
  planCoverage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  planRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coveragePill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  coveragePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  uncheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  selectionSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectionSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA',
  },
});
