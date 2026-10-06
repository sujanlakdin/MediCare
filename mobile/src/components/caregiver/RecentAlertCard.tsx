import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface RecentAlertCardProps {
  title?: string;
  dueTime?: string;
  medicationName?: string;
  onViewAlert?: () => void;
}

export function RecentAlertCard({
  title = 'Missed Dose',
  dueTime = 'Due 12:30 PM',
  medicationName = 'Metformin 500mg',
  onViewAlert,
}: RecentAlertCardProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      <View style={styles.alertCard}>
        <View style={styles.leftContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={18} color={Colors.light.alert} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.alertSubtitle}>
              <Text style={styles.alertHighlight}>{title}</Text> • {dueTime}
            </Text>
            <Text style={styles.medName}>{medicationName}</Text>
          </View>
        </View>
        <Pressable style={styles.actionButton} onPress={onViewAlert}>
          <Text style={styles.actionText}>View Alert</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  alertSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  alertHighlight: {
    fontWeight: '700',
    color: Colors.light.alert,
  },
  medName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: Colors.light.alert,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
