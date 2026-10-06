import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface WeeklyChartProps {
  data?: { day: string; val: number }[];
}

const DEFAULT_DATA = [
  { day: 'Mon', val: 90 },
  { day: 'Tue', val: 100 },
  { day: 'Wed', val: 75 },
  { day: 'Thu', val: 85 },
  { day: 'Fri', val: 90 },
  { day: 'Sat', val: 50 },
  { day: 'Sun', val: 95 },
];

export function WeeklyChart({ data = DEFAULT_DATA }: WeeklyChartProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Weekly Activity</Text>
      <View style={styles.chartRow}>
        {data.map((item, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.valText}>{item.val}%</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${item.val}%`,
                    backgroundColor:
                      item.val < 70 ? Colors.light.warning : Colors.light.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.dayText}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 20,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  valText: {
    fontSize: 9,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  barTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#E8F2EC',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  dayText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
});
