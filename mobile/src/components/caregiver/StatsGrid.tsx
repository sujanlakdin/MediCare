import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface StatsGridProps {
  adherencePercent?: number;
  dosesTaken?: string;
  missedCount?: number;
}

export function StatsGrid({
  adherencePercent = 80,
  dosesTaken = '4/5',
  missedCount = 1,
}: StatsGridProps) {
  return (
    <View style={styles.gridRow}>
      {/* Adherence Card */}
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>ADHERENCE</Text>
        <Text style={[styles.statValue, { color: Colors.light.accent }]}>
          {adherencePercent}%
        </Text>
      </View>

      {/* Doses Taken Card */}
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>DOSES TAKEN</Text>
        <Text style={styles.statValue}>{dosesTaken}</Text>
      </View>

      {/* Missed Card */}
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>MISSED</Text>
        <Text style={[styles.statValue, { color: Colors.light.alert }]}>
          {missedCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
});
