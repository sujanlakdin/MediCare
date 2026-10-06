import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export interface ScheduleItem {
  id: string;
  period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  medications: string;
  status: 'Completed' | 'Missed' | 'Scheduled';
  scheduledTime?: string;
}

interface ScheduleListProps {
  items?: ScheduleItem[];
}

const DEFAULT_ITEMS: ScheduleItem[] = [
  {
    id: '1',
    period: 'MORNING',
    medications: 'Lisinopril 10mg, Atorvastatin 20mg',
    status: 'Completed',
  },
  {
    id: '2',
    period: 'AFTERNOON',
    medications: 'Metformin 500mg',
    status: 'Missed',
  },
  {
    id: '3',
    period: 'EVENING',
    medications: 'Metformin 500mg',
    status: 'Scheduled',
    scheduledTime: '6:00 PM',
  },
];

export function ScheduleList({ items = DEFAULT_ITEMS }: ScheduleListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      <View style={styles.listGap}>
        {items.map((item) => {
          const isMissed = item.status === 'Missed';
          const isCompleted = item.status === 'Completed';

          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                isMissed && styles.missedCard,
              ]}>
              <View style={styles.leftCol}>
                <Text style={styles.periodText}>{item.period}</Text>
                <Text style={styles.medText}>{item.medications}</Text>
              </View>
              <View style={styles.rightCol}>
                {isCompleted && (
                  <Text style={styles.completedText}>Completed</Text>
                )}
                {isMissed && <Text style={styles.missedText}>Missed</Text>}
                {item.status === 'Scheduled' && (
                  <Text style={styles.scheduledText}>
                    Scheduled — {item.scheduledTime || '6:00 PM'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
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
  listGap: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  missedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  periodText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  medText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.accent,
  },
  missedText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.alert,
  },
  scheduledText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
});
