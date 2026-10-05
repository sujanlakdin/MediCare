import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';

type TimeRange = '7d' | '30d';

interface DayTrend {
  day: string;
  height: number; // percentage (0 - 100)
  color: string;
  isCurrent?: boolean;
}

interface MedicationAdherence {
  id: string;
  name: string;
  dosage: string;
  period: string;
  percentage: number;
  color: string;
  bgColor: string;
  trackColor: string;
}

interface PeriodData {
  overallPercentage: number;
  takenCount: number;
  missedCount: number;
  lateCount: number;
  takenFill: number;
  missedFill: number;
  lateFill: number;
  streakDays: number;
  streakMessage: string;
  weeklyTrend: DayTrend[];
  medications: MedicationAdherence[];
}

const MOCK_DATA: Record<TimeRange, PeriodData> = {
  '7d': {
    overallPercentage: 84,
    takenCount: 26,
    missedCount: 3,
    lateCount: 2,
    takenFill: 84,
    missedFill: 24,
    lateFill: 14,
    streakDays: 5,
    streakMessage: "You're on track. Keep it up!",
    weeklyTrend: [
      { day: 'M', height: 50, color: '#DCF5E9' },
      { day: 'T', height: 72, color: '#DCF5E9' },
      { day: 'W', height: 38, color: '#FEE2E2' }, // Light red/pink missed bar
      { day: 'T', height: 95, color: '#2BB673', isCurrent: true }, // Current highlighted day
      { day: 'F', height: 62, color: '#DCF5E9' },
      { day: 'S', height: 74, color: '#DCF5E9' },
      { day: 'S', height: 86, color: '#DCF5E9' },
    ],
    medications: [
      {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        period: 'Morning',
        percentage: 100,
        color: '#2BB673',
        bgColor: '#E6F4EE',
        trackColor: '#E6F4EE',
      },
      {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        period: 'Evening',
        percentage: 65,
        color: '#EF4444',
        bgColor: '#FEE2E2',
        trackColor: '#FEE2E2',
      },
    ],
  },
  '30d': {
    overallPercentage: 88,
    takenCount: 108,
    missedCount: 9,
    lateCount: 5,
    takenFill: 88,
    missedFill: 18,
    lateFill: 10,
    streakDays: 12,
    streakMessage: 'Outstanding consistency this month!',
    weeklyTrend: [
      { day: 'M', height: 80, color: '#DCF5E9' },
      { day: 'T', height: 85, color: '#DCF5E9' },
      { day: 'W', height: 60, color: '#FEE2E2' },
      { day: 'T', height: 100, color: '#2BB673', isCurrent: true },
      { day: 'F', height: 88, color: '#DCF5E9' },
      { day: 'S', height: 90, color: '#DCF5E9' },
      { day: 'S', height: 94, color: '#DCF5E9' },
    ],
    medications: [
      {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        period: 'Morning',
        percentage: 98,
        color: '#2BB673',
        bgColor: '#E6F4EE',
        trackColor: '#E6F4EE',
      },
      {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        period: 'Evening',
        percentage: 78,
        color: '#EF4444',
        bgColor: '#FEE2E2',
        trackColor: '#FEE2E2',
      },
    ],
  },
};

export default function AdherenceScreen() {
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');

  const currentData = MOCK_DATA[selectedRange];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/medication-schedule' as any);
    }
  };

  const handleCalendar = () => {
    Alert.alert(
      'Date Range Selection',
      `Currently displaying adherence records for the ${
        selectedRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'
      }.`
    );
  };

  const handleReviewFullHistory = () => {
    router.push('/history' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Hide Expo Router default header & tabs */}
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false, title: '' }} />
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Top Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button">
              <Ionicons name="arrow-back" size={24} color="#1E3228" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Adherence</Text>

            <TouchableOpacity
              onPress={handleCalendar}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.calendarButton}
              activeOpacity={0.7}
              accessibilityLabel="Select date range"
              accessibilityRole="button">
              <Ionicons name="calendar-outline" size={22} color="#1E3228" />
            </TouchableOpacity>
          </View>

          {/* Time Range Toggle Pills (Last 7 Days / Last 30 Days) */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.togglePill,
                selectedRange === '7d' ? styles.togglePillActive : styles.togglePillInactive,
              ]}
              onPress={() => setSelectedRange('7d')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRange === '7d' }}>
              <Text
                style={[
                  styles.toggleText,
                  selectedRange === '7d' ? styles.toggleTextActive : styles.toggleTextInactive,
                ]}>
                Last 7 Days
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.togglePill,
                selectedRange === '30d' ? styles.togglePillActive : styles.togglePillInactive,
              ]}
              onPress={() => setSelectedRange('30d')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRange === '30d' }}>
              <Text
                style={[
                  styles.toggleText,
                  selectedRange === '30d' ? styles.toggleTextActive : styles.toggleTextInactive,
                ]}>
                Last 30 Days
              </Text>
            </TouchableOpacity>
          </View>

          {/* Overall Adherence Card */}
          <View style={styles.card}>
            <Text style={styles.overallLabel}>OVERALL ADHERENCE</Text>
            <Text style={styles.overallValue}>{currentData.overallPercentage}%</Text>

            {/* Taken / Missed / Late Counts & Mini Progress Bars */}
            <View style={styles.statusMetricsRow}>
              {/* Taken Metric */}
              <View style={styles.statusMetricCol}>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${currentData.takenFill}%`,
                        backgroundColor: '#2BB673',
                      },
                    ]}
                  />
                </View>
                <View style={styles.metricLabelRow}>
                  <Ionicons name="checkmark" size={13} color="#2BB673" />
                  <Text style={styles.metricName}>Taken</Text>
                  <Text style={styles.metricCount}>({currentData.takenCount})</Text>
                </View>
              </View>

              {/* Missed Metric */}
              <View style={styles.statusMetricCol}>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${currentData.missedFill}%`,
                        backgroundColor: '#EF4444',
                      },
                    ]}
                  />
                </View>
                <View style={styles.metricLabelRow}>
                  <Ionicons name="close" size={13} color="#EF4444" />
                  <Text style={styles.metricName}>Missed</Text>
                  <Text style={styles.metricCount}>({currentData.missedCount})</Text>
                </View>
              </View>

              {/* Late Metric */}
              <View style={styles.statusMetricCol}>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${currentData.lateFill}%`,
                        backgroundColor: '#F59E0B',
                      },
                    ]}
                  />
                </View>
                <View style={styles.metricLabelRow}>
                  <Ionicons name="time" size={13} color="#F59E0B" />
                  <Text style={styles.metricName}>Late</Text>
                  <Text style={styles.metricCount}>({currentData.lateCount})</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weekly Trend Bar Chart */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Weekly Trend</Text>
            <View style={styles.chartArea}>
              <View style={styles.barsContainer}>
                {currentData.weeklyTrend.map((item, index) => (
                  <View key={`${item.day}-${index}`} style={styles.barColumn}>
                    <View style={styles.barSlot}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${item.height}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barLabel,
                        item.isCurrent && styles.barLabelHighlight,
                      ]}>
                      {item.day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 5 Day Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakIconCircle}>
              <Ionicons name="flame" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakTitle}>{currentData.streakDays} Day Streak!</Text>
              <Text style={styles.streakSubtitle}>{currentData.streakMessage}</Text>
            </View>
          </View>

          {/* Medication Breakdown Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medication Breakdown</Text>
          </View>

          {currentData.medications.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medTopRow}>
                {/* Pill Icon Box */}
                <View style={[styles.pillIconBox, { backgroundColor: med.bgColor }]}>
                  <MaterialCommunityIcons name="pill" size={24} color={med.color} />
                </View>

                {/* Medication Details */}
                <View style={styles.medDetails}>
                  <Text style={styles.medNameText}>{med.name}</Text>
                  <Text style={styles.medSubText}>
                    {med.dosage} • {med.period}
                  </Text>
                </View>

                {/* Adherence Percentage */}
                <Text style={[styles.medPercentageText, { color: med.color }]}>
                  {med.percentage}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={[styles.medProgressTrack, { backgroundColor: med.trackColor }]}>
                <View
                  style={[
                    styles.medProgressFill,
                    {
                      width: `${med.percentage}%`,
                      backgroundColor: med.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}

          {/* Review Full History Button */}
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={handleReviewFullHistory}
            activeOpacity={0.85}
            accessibilityRole="button">
            <MaterialCommunityIcons name="history" size={20} color="#FFFFFF" />
            <Text style={styles.reviewButtonText}>Review Full History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3FAF7',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
    alignItems: 'center',
    backgroundColor: '#F3FAF7',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 6,
  },
  backButton: {
    paddingRight: 14,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#154D38',
    letterSpacing: -0.3,
  },
  calendarButton: {
    marginLeft: 'auto',
    paddingLeft: 14,
    paddingVertical: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    marginTop: 4,
  },
  togglePill: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillActive: {
    backgroundColor: '#2BB673',
    shadowColor: '#2BB673',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  togglePillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1.5,
  },
  overallLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2BB673',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
  },
  statusMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  statusMetricCol: {
    flex: 1,
  },
  miniBarTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 2.5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metricName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  metricCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#154D38',
    marginBottom: 18,
  },
  chartArea: {
    paddingHorizontal: 4,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barSlot: {
    height: 94,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  barFill: {
    width: 24,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  barLabelHighlight: {
    color: '#154D38',
    fontWeight: '700',
  },
  streakCard: {
    backgroundColor: '#E4F6EE',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#D4EFE4',
  },
  streakIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2BB673',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2BB673',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#154D38',
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A6054',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#154D38',
    letterSpacing: -0.2,
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  medTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medDetails: {
    flex: 1,
  },
  medNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  medSubText: {
    fontSize: 13,
    color: '#64748B',
  },
  medPercentageText: {
    fontSize: 16,
    fontWeight: '700',
  },
  medProgressTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
    width: '100%',
  },
  medProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  reviewButton: {
    backgroundColor: '#1E2B24',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
