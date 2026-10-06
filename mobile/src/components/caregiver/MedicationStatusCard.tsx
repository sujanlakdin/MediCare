import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { CircularGauge } from './CircularGauge';

interface MedicationStatusCardProps {
  completedDoses?: number;
  totalDoses?: number;
  adherencePercent?: number;
  statusNote?: string;
}

export function MedicationStatusCard({
  completedDoses = 4,
  totalDoses = 5,
  adherencePercent = 80,
  statusNote = 'Eleanor is on track today.',
}: MedicationStatusCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.title}>Today's Medication Status</Text>
        <Text style={styles.mainStat}>
          {completedDoses} of {totalDoses} doses
        </Text>
        <Text style={styles.statusCompleted}>completed</Text>
        <Text style={styles.statusNote}>{statusNote}</Text>
      </View>
      <View style={styles.rightCol}>
        <CircularGauge percentage={adherencePercent} size={76} strokeWidth={7} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 14,
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  mainStat: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.4,
  },
  statusCompleted: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.accent,
    marginBottom: 6,
  },
  statusNote: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
