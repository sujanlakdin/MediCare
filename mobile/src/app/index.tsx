import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CaregiverHeader } from '@/components/caregiver/Header';
import { PatientCard } from '@/components/caregiver/PatientCard';
import { MedicationStatusCard } from '@/components/caregiver/MedicationStatusCard';
import { StatsGrid } from '@/components/caregiver/StatsGrid';
import { RecentAlertCard } from '@/components/caregiver/RecentAlertCard';
import { ScheduleList } from '@/components/caregiver/ScheduleList';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Top Header */}
          <CaregiverHeader
            caregiverName="Sarah"
            subtext="Here's Eleanor's medication update"
            notificationCount={1}
            onNotificationPress={() => router.push('/alerts')}
            onProfilePress={() => router.push('/profile')}
          />

          {/* Patient Active Card */}
          <PatientCard
            patientName="Eleanor Johnson"
            patientAge={68}
            patientRole="Patient"
            statusBadgeText="MONITORING ACTIVE"
            onPress={() => router.push('/patients')}
          />

          {/* Today's Medication Status Gauge */}
          <MedicationStatusCard
            completedDoses={4}
            totalDoses={5}
            adherencePercent={80}
            statusNote="Eleanor is on track today."
          />

          {/* Adherence Stats Row */}
          <StatsGrid adherencePercent={80} dosesTaken="4/5" missedCount={1} />

          {/* Recent Alert Card */}
          <RecentAlertCard
            title="Missed Dose"
            dueTime="Due 12:30 PM"
            medicationName="Metformin 500mg"
            onViewAlert={() => router.push('/alerts')}
          />

          {/* Today's Schedule */}
          <ScheduleList />
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
});
