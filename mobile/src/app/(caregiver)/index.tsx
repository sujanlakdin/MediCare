import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CaregiverHeader } from '@/components/caregiver/Header';
import { PatientCard } from '@/components/caregiver/PatientCard';
import { MedicationStatusCard } from '@/components/caregiver/MedicationStatusCard';
import { StatsGrid } from '@/components/caregiver/StatsGrid';
import { RecentAlertCard } from '@/components/caregiver/RecentAlertCard';
import { ScheduleList, ScheduleItem } from '@/components/caregiver/ScheduleList';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { patientApi, medicationApi, PatientItem, MedicationItem } from '@/services/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const patientList = await patientApi.getPatients();

      // If user is logged in, ensure user is present in patient list
      if (user && user.fullName) {
        const exists = patientList.some((p) => p._id === user.id || p.name.toLowerCase() === user.fullName.toLowerCase());
        if (!exists) {
          patientList.unshift({
            _id: user.id || 'user-' + Date.now(),
            name: user.fullName,
            age: 65,
            role: user.role === 'caregiver' ? 'Caregiver' : 'Patient',
            statusBadgeText: 'MONITORING ACTIVE',
            phone: '+94 77 123 4567',
            vitals: {
              bloodPressure: '120/80',
              heartRate: 72,
              bloodSugar: 110,
            },
          });
        }
      }

      setPatients(patientList);
      if (patientList.length > 0) {
        const firstPatient = patientList[0];
        setSelectedPatient(firstPatient);
        fetchMedicationsForPatient(firstPatient._id);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicationsForPatient = async (patientId: string) => {
    try {
      const medList = await medicationApi.getMedications(patientId);
      setMedications(medList);
    } catch (error) {
      console.error('Error fetching medications for patient:', error);
    }
  };

  const handleSelectPatient = (patient: PatientItem) => {
    setSelectedPatient(patient);
    fetchMedicationsForPatient(patient._id);
  };

  // Calculate dynamic stats
  const completedDoses = useMemo(
    () => medications.filter((m) => m.status === 'taken').length,
    [medications]
  );
  const missedCount = useMemo(
    () => medications.filter((m) => m.status === 'missed').length,
    [medications]
  );
  const totalDoses = medications.length || 1;
  const adherencePercent = useMemo(
    () => (totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0),
    [completedDoses, totalDoses]
  );

  // Convert medications to ScheduleList items
  const scheduleItems: ScheduleItem[] = useMemo(() => {
    if (!medications || medications.length === 0) return [];
    return medications.map((med) => {
      let period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' = 'MORNING';
      const timeUpper = (med.scheduledTime || '').toUpperCase();
      if (timeUpper.includes('PM')) {
        if (timeUpper.includes('12:') || timeUpper.includes('1:') || timeUpper.includes('2:') || timeUpper.includes('3:') || timeUpper.includes('4:')) {
          period = 'AFTERNOON';
        } else if (timeUpper.includes('5:') || timeUpper.includes('6:') || timeUpper.includes('7:') || timeUpper.includes('8:')) {
          period = 'EVENING';
        } else {
          period = 'NIGHT';
        }
      }

      let status: 'Completed' | 'Missed' | 'Scheduled' = 'Scheduled';
      if (med.status === 'taken') status = 'Completed';
      else if (med.status === 'missed') status = 'Missed';

      return {
        id: med._id || String(Math.random()),
        period,
        medications: `${med.name} ${med.dosage}`,
        status,
        scheduledTime: med.scheduledTime,
      };
    });
  }, [medications]);

  const firstName = selectedPatient?.name ? selectedPatient.name.split(' ')[0] : 'Patient';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Top Header */}
          <CaregiverHeader
            caregiverName={user?.fullName ? user.fullName.split(' ')[0] : 'Sarah'}
            subtext={`Here's ${firstName}'s medication update`}
            notificationCount={missedCount}
            onNotificationPress={() => router.push('/(caregiver)/alerts')}
            onProfilePress={() => router.push('/(caregiver)/profile')}
          />

          {/* Patient Switcher / Active Card */}
          <PatientCard
            patientName={selectedPatient?.name || 'Eleanor Johnson'}
            patientAge={selectedPatient?.age || 68}
            patientRole={selectedPatient?.role || 'Patient'}
            statusBadgeText={selectedPatient?.statusBadgeText || 'MONITORING ACTIVE'}
            patientsList={patients}
            selectedPatientId={selectedPatient?._id}
            onSelectPatient={handleSelectPatient}
            onPress={() => router.push('/(caregiver)/patients')}
          />

          {/* Today's Medication Status Gauge */}
          <MedicationStatusCard
            completedDoses={completedDoses}
            totalDoses={totalDoses}
            adherencePercent={adherencePercent}
            statusNote={`${firstName} has ${completedDoses} of ${totalDoses} doses taken today.`}
          />

          {/* Adherence Stats Row */}
          <StatsGrid
            adherencePercent={adherencePercent}
            dosesTaken={`${completedDoses}/${totalDoses}`}
            missedCount={missedCount}
          />

          {/* Recent Alert Card if missed doses exist */}
          {missedCount > 0 && (
            <RecentAlertCard
              title="Missed Dose"
              dueTime="Action Needed"
              medicationName={
                medications.find((m) => m.status === 'missed')?.name || 'Medication Dose'
              }
              onViewAlert={() => router.push('/(caregiver)/alerts')}
            />
          )}

          {/* Today's Schedule */}
          <ScheduleList items={scheduleItems.length > 0 ? scheduleItems : undefined} />
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
