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

function getCountdownText(timeStr?: string): { label: string; isUpcoming?: boolean; badgeColor?: string } {
  if (!timeStr) return { label: 'Scheduled' };

  try {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { label: `Scheduled — ${timeStr}` };

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);

    let diffMs = scheduledDate.getTime() - now.getTime();

    // If scheduled time was early morning (e.g. 12:00 AM) and now is late night (10:40 PM), it refers to next day
    if (diffMs < -12 * 60 * 60 * 1000) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      diffMs = scheduledDate.getTime() - now.getTime();
    }

    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins > 0) {
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      if (h > 0) {
        return { label: `Due in ${h}h ${m}m (${timeStr})`, isUpcoming: true, badgeColor: Colors.light.primary };
      }
      return { label: `Due in ${m}m (${timeStr})`, isUpcoming: true, badgeColor: '#D97706' };
    } else if (diffMins >= -60) {
      return { label: `Due Now (${timeStr})`, isUpcoming: true, badgeColor: Colors.light.alert };
    } else {
      return { label: `Scheduled — ${timeStr}`, isUpcoming: false, badgeColor: Colors.light.textSecondary };
    }
  } catch (err) {
    return { label: `Scheduled — ${timeStr}` };
  }
}

export function ScheduleList({ items = [] }: ScheduleListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      <View style={styles.listGap}>
        {items.length === 0 ? (
          <View style={styles.itemCard}>
            <Text style={{ fontSize: 13, color: Colors.light.textSecondary, fontStyle: 'italic' }}>
              No medications scheduled for today.
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const isMissed = item.status === 'Missed';
            const isCompleted = item.status === 'Completed';
            const countdownInfo = item.status === 'Scheduled' ? getCountdownText(item.scheduledTime) : null;

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
                  {item.status === 'Scheduled' && countdownInfo && (
                    <Text
                      style={[
                        styles.scheduledText,
                        countdownInfo.isUpcoming && { fontWeight: '700', color: countdownInfo.badgeColor },
                      ]}>
                      {countdownInfo.label}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
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
