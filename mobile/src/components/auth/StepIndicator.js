import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../theme';

/**
 * StepIndicator Component
 * Renders horizontal indicator bars for multi-step flows (Forgot -> OTP -> Reset)
 * @param {Object} props
 * @param {number} [props.currentStep] - 1, 2, or 3
 * @param {number} [props.totalSteps] - default 3
 */
export default function StepIndicator({ currentStep = 1, totalSteps = 3 }) {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index < currentStep;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              isActive && styles.barActive,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 14,
  },
  bar: {
    width: 26,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  barActive: {
    backgroundColor: COLORS.brand,
  },
});
