import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface HealthScoreCardProps {
  score?: number;
  statusText?: string;
  onViewCompleteHistory?: () => void;
}

export function HealthScoreCard({
  score = 78,
  statusText = 'Good — Improving',
  onViewCompleteHistory,
}: HealthScoreCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Patient Progress</Text>
      <Text style={styles.sectionSub}>Eleanor Johnson's Health Journey</Text>

      {/* Main Semi Circle Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall Health Score</Text>
        <View style={styles.gaugeContainer}>
          <Text style={styles.scoreNumber}>{score}/100</Text>
          <Text style={styles.scoreStatus}>{statusText}</Text>
        </View>
      </View>

      {/* 4 Metric Cards Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MEDICATION ADHERENCE</Text>
          <Text style={styles.metricValue}>85%</Text>
          <Text style={styles.metricSubGreen}>↑ Improving</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>APPOINTMENT ATTENDANCE</Text>
          <Text style={styles.metricValue}>100%</Text>
          <Text style={styles.metricSubGreen}>Excellent</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>VITALS STABILITY</Text>
          <Text style={styles.metricValue}>Stable</Text>
          <Text style={styles.metricSubGreen}>Normal range</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>MOOD & WELLNESS</Text>
          <Text style={styles.metricValue}>Good</Text>
          <Text style={styles.metricSubGreen}>Consistent</Text>
        </View>
      </View>

      {/* Milestones Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeaderTitle}>Milestones</Text>

        <View style={styles.milestoneItem}>
          <View style={styles.greenDot} />
          <View>
            <Text style={styles.milestoneTitle}>30 Days Streak</Text>
            <Text style={styles.milestoneDate}>Achieved Sept 5</Text>
          </View>
        </View>

        <View style={styles.milestoneItem}>
          <View style={styles.greenDot} />
          <View>
            <Text style={styles.milestoneTitle}>90% Monthly Adherence</Text>
            <Text style={styles.milestoneDate}>Achieved Aug 31</Text>
          </View>
        </View>

        <View style={styles.milestoneItem}>
          <View style={styles.hollowDot} />
          <View>
            <Text style={styles.milestoneTitle}>6-Month Check-up</Text>
            <Text style={styles.milestoneDate}>Upcoming Oct 15</Text>
          </View>
        </View>
      </View>

      {/* Doctor Note */}
      <View style={styles.doctorNoteCard}>
        <View style={styles.noteHeader}>
          <Text style={styles.doctorLabel}>DOCTOR'S NOTE</Text>
          <Text style={styles.noteDate}>Sept 10</Text>
        </View>
        <Text style={styles.doctorName}>Dr. Patel</Text>
        <Text style={styles.noteBody}>
          "Blood pressure improving. Continue current medications. Next visit Oct 15."
        </Text>
      </View>

      <Pressable style={styles.historyOutlineBtn} onPress={onViewCompleteHistory}>
        <Text style={styles.historyOutlineBtnText}>View Complete History</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sectionSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 14,
  },
  scoreCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  scoreLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 10,
    fontWeight: '600',
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  scoreStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.accent,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  metricSubGreen: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.accent,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.accent,
  },
  hollowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.light.textMuted,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  milestoneDate: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  doctorNoteCard: {
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  doctorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  noteDate: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  historyOutlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  historyOutlineBtnText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
