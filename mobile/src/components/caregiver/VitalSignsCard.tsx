import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface VitalSignsCardProps {
  bloodPressure?: string;
  heartRate?: number;
  bloodSugar?: number;
  onViewHistory?: () => void;
}

export function VitalSignsCard({
  bloodPressure = '128/82',
  heartRate = 72,
  bloodSugar = 145,
  onViewHistory,
}: VitalSignsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Vital Signs</Text>
      
      <View style={styles.gridRow}>
        {/* BP */}
        <View style={styles.vitalCard}>
          <View style={styles.vitalHeader}>
            <Text style={styles.vitalLabel}>BLOOD PRE...</Text>
            <Ionicons name="pulse" size={14} color={Colors.light.accent} />
          </View>
          <Text style={styles.vitalValue}>
            {bloodPressure} <Text style={styles.vitalUnit}>mmHg</Text>
          </Text>
        </View>

        {/* HR */}
        <View style={styles.vitalCard}>
          <View style={styles.vitalHeader}>
            <Text style={styles.vitalLabel}>HEART RATE</Text>
            <Ionicons name="heart" size={14} color={Colors.light.accent} />
          </View>
          <Text style={styles.vitalValue}>
            {heartRate} <Text style={styles.vitalUnit}>bpm</Text>
          </Text>
        </View>

        {/* Glucose */}
        <View style={styles.vitalCard}>
          <View style={styles.vitalHeader}>
            <Text style={styles.vitalLabel}>BLOOD SUG...</Text>
            <Ionicons name="water-outline" size={14} color={Colors.light.alert} />
          </View>
          <Text style={styles.vitalValue}>
            {bloodSugar} <Text style={styles.vitalUnit}>mg/dL</Text>
          </Text>
        </View>
      </View>

      <Pressable style={styles.historyBtn} onPress={onViewHistory}>
        <Text style={styles.historyBtnText}>View Full History</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vitalLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  vitalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  vitalUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  historyBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  historyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
