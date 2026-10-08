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
import { caregiverProfileStore } from '@/services/caregiverProfileStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [caregiverProfile, setCaregiverProfile] = useState(caregiverProfileStore.getProfile());
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
    const unsubscribe = caregiverProfileStore.subscribe((updated) => {
      setCaregiverProfile(updated);
    });
    return () => unsubscribe();
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      let patientList = await patientApi.getPatients();

      // Ensure caregivers are excluded from the patient selection list
      patientList = patientList.filter((p) => {
        const isCaregiverRole = p.role && p.role.toLowerCase() === 'caregiver';
        const isCurrentUserCaregiver = user && user.role === 'caregiver' && user.fullName && p.name.toLowerCase() === user.fullName.toLowerCase();
        return !isCaregiverRole && !isCurrentUserCaregiver;
      });

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

  // Convert medications to ScheduleList items (supporting multi-dose times e.g. 08:00 AM, 04:00 PM, 12:00 AM)
  const scheduleItems: ScheduleItem[] = useMemo(() => {
    if (!medications || medications.length === 0) return [];
    const items: ScheduleItem[] = [];

    medications.forEach((med) => {
      const times = (med.scheduledTime || '08:00 AM').split(',').map((t) => t.trim());
      times.forEach((singleTime, idx) => {
        let period: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' = 'MORNING';
        const timeUpper = singleTime.toUpperCase();

        if (timeUpper.includes('PM')) {
          if (timeUpper.includes('12:') || timeUpper.includes('1:') || timeUpper.includes('2:') || timeUpper.includes('3:') || timeUpper.includes('4:')) {
            period = 'AFTERNOON';
          } else if (timeUpper.includes('5:') || timeUpper.includes('6:') || timeUpper.includes('7:') || timeUpper.includes('8:')) {
            period = 'EVENING';
          } else {
            period = 'NIGHT';
          }
        } else if (timeUpper.includes('AM')) {
          if (timeUpper.includes('12:')) {
            period = 'NIGHT';
          }
        }

        let status: 'Completed' | 'Missed' | 'Scheduled' = 'Scheduled';
        if (med.status === 'taken') status = 'Completed';
        else if (med.status === 'missed') status = 'Missed';

        items.push({
          id: `${med._id || String(Math.random())}-${idx}`,
          period,
          medications: `${med.name} ${med.dosage || ''}`.trim(),
          status,
          scheduledTime: singleTime,
        });
      });
    });

    return items;
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
            caregiverName={caregiverProfile.name ? caregiverProfile.name.split(' ')[0] : 'Kasun'}
            avatarUrl={caregiverProfile.avatarUrl}
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
          <ScheduleList items={scheduleItems} />
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
