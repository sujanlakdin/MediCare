import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { PATIENT_COLORS } from '../../constants/patientTheme';

interface ProgressRingProps {
  percent: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({
  percent = 0,
  size = 92,
  strokeWidth = 10,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  const isWeb = Platform.OS === 'web';

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={`Today's progress: ${clamped} percent`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      {isWeb ? (
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', display: 'block' }}
          aria-hidden="true"
        >
          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={PATIENT_COLORS.ringTrack}
            strokeWidth={strokeWidth}
          />
          {/* Foreground progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={PATIENT_COLORS.ringProgress}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.35s ease' }}
          />
        </svg>
      ) : (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={PATIENT_COLORS.ringTrack}
              strokeWidth={strokeWidth}
            />
            <Circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={PATIENT_COLORS.ringProgress}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${strokeDashoffset}`}
            />
          </G>
        </Svg>
      )}

      {/* Centered percentage label */}
      <View style={styles.centerLabel}>
        <Text style={styles.percentText} allowFontScaling={true}>
          {clamped}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 19,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
  },
});
