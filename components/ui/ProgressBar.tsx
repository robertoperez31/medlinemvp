import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface ProgressBarProps {
  steps: number;
  current: number;
  labels?: string[];
}

function CheckmarkIcon() {
  return (
    <Text style={styles.checkmark}>✓</Text>
  );
}

interface StepCircleProps {
  index: number;
  current: number;
  total: number;
  label?: string;
}

function StepCircle({ index, current, label }: StepCircleProps) {
  const stepNumber = index + 1;
  const isCompleted = stepNumber < current;
  const isCurrent = stepNumber === current;
  const isFuture = stepNumber > current;

  let circleStyle = styles.circleBase;
  let contentStyle = isFuture ? styles.circleContentFuture : styles.circleContentActive;

  if (isCompleted) {
    circleStyle = { ...styles.circleBase, ...styles.circleCompleted };
  } else if (isCurrent) {
    circleStyle = { ...styles.circleBase, ...styles.circleCurrent };
  } else {
    circleStyle = { ...styles.circleBase, ...styles.circleFuture };
    contentStyle = styles.circleContentFuture;
  }

  return (
    <View style={styles.stepWrapper}>
      <View style={circleStyle}>
        {isCompleted ? (
          <CheckmarkIcon />
        ) : (
          <Text style={[styles.stepNumber, contentStyle]}>{stepNumber}</Text>
        )}
      </View>
      {label != null && label.length > 0 && (
        <Text
          style={[
            styles.stepLabel,
            isCompleted || isCurrent ? styles.stepLabelActive : styles.stepLabelFuture,
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

interface ConnectorProps {
  index: number;
  current: number;
}

function Connector({ index, current }: ConnectorProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const stepNumber = index + 1;
  const isFilled = stepNumber < current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: isFilled ? 1 : 0,
      duration: 400,
      delay: isFilled ? index * 100 : 0,
      useNativeDriver: false,
    }).start();
  }, [isFilled, index, fillAnim]);

  return (
    <View style={styles.connectorTrack}>
      <Animated.View
        style={[
          styles.connectorFill,
          {
            width: fillAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

export function ProgressBar({ steps, current, labels = [] }: ProgressBarProps) {
  const clampedCurrent = Math.max(1, Math.min(current, steps));
  const stepsArray = Array.from({ length: steps }, (_, i) => i);

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps, now: clampedCurrent }}>
      <View style={styles.row}>
        {stepsArray.map((_, index) => (
          <React.Fragment key={index}>
            <StepCircle
              index={index}
              current={clampedCurrent}
              total={steps}
              label={labels[index]}
            />
            {index < steps - 1 && (
              <Connector index={index} current={clampedCurrent} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 0,
    minWidth: 32,
    maxWidth: 64,
  },
  circleBase: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#4338CA',
  },
  circleCurrent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4338CA',
  },
  circleFuture: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 16,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  circleContentActive: {
    color: '#4338CA',
  },
  circleContentFuture: {
    color: '#94A3B8',
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    maxWidth: 60,
  },
  stepLabelActive: {
    color: '#0F172A',
    fontWeight: '500',
  },
  stepLabelFuture: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  connectorTrack: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 15,
    marginHorizontal: 4,
    borderRadius: 1,
    overflow: 'hidden',
  },
  connectorFill: {
    height: '100%',
    backgroundColor: '#4338CA',
    borderRadius: 1,
  },
});
