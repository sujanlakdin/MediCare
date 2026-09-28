import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PatientCard } from '@/components/caregiver/PatientCard';
import { CircularGauge } from '@/components/caregiver/CircularGauge';
import { WeeklyChart } from '@/components/caregiver/WeeklyChart';
import { HealthScoreCard } from '@/components/caregiver/HealthScoreCard';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function ReportsScreen() {
  const router = useRouter();
  const [reportTab, setReportTab] = useState<'adherence' | 'progress'>('adherence');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Adherence Reports</Text>
            <Text style={styles.pageSub}>Adherence overview</Text>
          </View>

          {/* Toggle Pills */}
          <View style={styles.pillToggleContainer}>
            <Pressable
              style={[
                styles.pillBtn,
                reportTab === 'adherence' && styles.pillBtnActive,
              ]}
              onPress={() => setReportTab('adherence')}>
              <Text
                style={[
                  styles.pillText,
                  reportTab === 'adherence' && styles.pillTextActive,
                ]}>
                Adherence Overview
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pillBtn,
                reportTab === 'progress' && styles.pillBtnActive,
              ]}
              onPress={() => setReportTab('progress')}>
              <Text
                style={[
                  styles.pillText,
                  reportTab === 'progress' && styles.pillTextActive,
                ]}>
                Patient Progress
              </Text>
            </Pressable>
          </View>

          {reportTab === 'adherence' ? (
            <>
              {/* Patient Card */}
              <PatientCard
                patientName="Eleanor Johnson"
                patientAge={68}
                patientRole="Patient"
                statusBadgeText="MONITORING ACTIVE"
              />

              {/* Overall Adherence Card */}
              <View style={styles.overallCard}>
                <View style={styles.overallTextCol}>
                  <Text style={styles.cardTitle}>Overall Adherence</Text>
                  <Text style={styles.trendSub}>Last 30 Days trend</Text>
                  <Text style={styles.ratingText}>Excellent rating</Text>
                </View>
                <CircularGauge percentage={85} size={76} strokeWidth={7} />
              </View>

              {/* Weekly Activity Bar Chart */}
              <WeeklyChart />

              {/* By Medication List */}
              <View style={styles.byMedCard}>
                <Text style={styles.cardTitle}>By Medication</Text>
                
                {/* Item 1 */}
                <View style={styles.medProgressRow}>
                  <View style={styles.medLabelRow}>
                    <Text style={styles.medName}>Lisinopril 10mg</Text>
                    <Text style={styles.medPercent}>95%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '95%' }]} />
                  </View>
                </View>

                {/* Item 2 */}
                <View style={styles.medProgressRow}>
                  <View style={styles.medLabelRow}>
                    <Text style={styles.medName}>Atorvastatin 20mg</Text>
                    <Text style={styles.medPercent}>90%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '90%' }]} />
                  </View>
                </View>

                {/* Item 3 */}
                <View style={styles.medProgressRow}>
                  <View style={styles.medLabelRow}>
                    <Text style={styles.medName}>Metformin 500mg</Text>
                    <Text style={styles.medPercent}>75%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: '75%', backgroundColor: Colors.light.warning },
                      ]}
                    />
                  </View>
                </View>

                {/* Item 4 */}
                <View style={styles.medProgressRow}>
                  <View style={styles.medLabelRow}>
                    <Text style={styles.medName}>Amlodipine 5mg</Text>
                    <Text style={styles.medPercent}>88%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '88%' }]} />
                  </View>
                </View>
              </View>

              {/* Monthly Trend */}
              <View style={styles.monthlyTrendCard}>
                <Text style={styles.cardTitle}>Monthly Trend</Text>
                <Text style={styles.trendSub}>Consistent improvement over 4 weeks</Text>
              </View>

              <Pressable
                style={styles.downloadBtn}
                onPress={() => alert('Report download initiated!')}>
                <Text style={styles.downloadBtnText}>Download Report</Text>
              </Pressable>
            </>
          ) : (
            /* Patient Progress (Health Journey View) */
            <HealthScoreCard
              score={78}
              statusText="Good — Improving"
              onViewCompleteHistory={() => router.push('/history')}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  headerRow: {
    paddingVertical: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  pageSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  pillToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F2EC',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  pillBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  overallCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  overallTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  trendSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.accent,
  },
  byMedCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 12,
  },
  medProgressRow: {
    gap: 4,
  },
  medLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  medPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E8F2EC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.accent,
    borderRadius: 4,
  },
  monthlyTrendCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  downloadBtn: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  downloadBtnText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
