import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';

const STRENGTH_COLORS = ['#C94A4A', '#E3A83B', '#3AB68B', '#006A4E'];
const STRENGTH_LABELS = ['Weak', 'Fair', 'Good', 'Strong'];

/**
 * Calculates strength score (0 to 4) based on password complexity
 */
export function calculatePasswordScore(password = '') {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/**
 * PasswordStrengthMeter Component
 * 4-bar dynamic meter representing password strength
 */
export default function PasswordStrengthMeter({ password = '' }) {
  const score = calculatePasswordScore(password);
  const activeColor = score > 0 ? STRENGTH_COLORS[score - 1] : COLORS.border;
  const label = password && score > 0 ? STRENGTH_LABELS[score - 1] : '';

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Password strength: ${label || 'Empty'}`}
    >
      <View style={styles.barsRow}>
        {[0, 1, 2, 3].map((index) => {
          const isActive = password.length > 0 && index < score;
          return (
            <View
              key={index}
              style={[
                styles.bar,
                { backgroundColor: isActive ? activeColor : COLORS.border },
              ]}
            />
          );
        })}
      </View>
      {Boolean(label) && (
        <Text style={[styles.labelText, { color: activeColor }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 6,
    alignItems: 'center',
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  labelText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginLeft: 8,
    minWidth: 48,
    textAlign: 'right',
  },
});
