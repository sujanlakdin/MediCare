import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface CircularGaugeProps {
  percentage: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  isSemiCircle?: boolean;
}

export function CircularGauge({
  percentage = 80,
  size = 80,
  strokeWidth = 8,
  label,
  color = Colors.light.accent,
  isSemiCircle = false,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  
  if (isSemiCircle) {
    return (
      <View style={[styles.semiContainer, { width: size, height: size / 2 + 15 }]}>
        <View
          style={[
            styles.semiBg,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: '#E8F2EC',
            },
          ]}
        />
        <View
          style={[
            styles.semiArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
        <View style={styles.semiTextContainer}>
          <Text style={styles.semiValue}>{percentage}/100</Text>
          {label && <Text style={styles.semiLabel}>{label}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#E8F2EC',
          },
        ]}
      />
      {/* Progress Arc simulation using rotated border segments */}
      <View
        style={[
          styles.ring,
          styles.progressArc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderRightColor: percentage >= 50 ? color : 'transparent',
            borderBottomColor: percentage >= 75 ? color : 'transparent',
            borderLeftColor: percentage >= 100 ? color : 'transparent',
            borderTopColor: color,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      {/* Inner Label */}
      <View style={styles.innerContent}>
        <Text style={[styles.percentageText, { fontSize: Math.max(14, size * 0.22) }]}>
          {label || `${percentage}%`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  progressArc: {
    borderStyle: 'solid',
  },
  innerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontWeight: '800',
    color: Colors.light.text,
  },
  semiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  semiBg: {
    position: 'absolute',
    top: 0,
  },
  semiArc: {
    position: 'absolute',
    top: 0,
  },
  semiTextContainer: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
  },
  semiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
  },
  semiLabel: {
    fontSize: 11,
    color: Colors.light.accent,
    fontWeight: '600',
  },
});
