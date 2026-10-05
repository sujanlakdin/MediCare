import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PatientCard } from '@/components/caregiver/PatientCard';
import { VitalSignsCard } from '@/components/caregiver/VitalSignsCard';
import { MedicationList } from '@/components/caregiver/MedicationList';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { patientApi, medicationApi, PatientItem, MedicationItem } from '@/services/api';

export default function PatientsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'oversight' | 'medications'>('oversight');
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [medications, setMedications] = useState<MedicationItem[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const list = await patientApi.getPatients();
      setPatients(list);
      if (list.length > 0) {
        setSelectedPatient(list[0]);
        loadMedications(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to load patients in PatientsScreen:', err);
    }
  };

  const loadMedications = async (patientId: string) => {
    try {
      const list = await medicationApi.getMedications(patientId);
      setMedications(list);
    } catch (err) {
      console.error('Failed to load medications:', err);
    }
  };

  const handleSelectPatient = (patient: PatientItem) => {
    setSelectedPatient(patient);
    loadMedications(patient._id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Top Title */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Patient Monitoring</Text>
            <Text style={styles.pageSub}>Detailed oversight</Text>
          </View>

          {/* Sub-tab pills */}
          <View style={styles.pillToggleContainer}>
            <Pressable
              style={[
                styles.pillBtn,
                activeTab === 'oversight' && styles.pillBtnActive,
              ]}
              onPress={() => setActiveTab('oversight')}>
              <Text
                style={[
                  styles.pillText,
                  activeTab === 'oversight' && styles.pillTextActive,
                ]}>
                Oversight & Vitals
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pillBtn,
                activeTab === 'medications' && styles.pillBtnActive,
              ]}
              onPress={() => setActiveTab('medications')}>
              <Text
                style={[
                  styles.pillText,
                  activeTab === 'medications' && styles.pillTextActive,
                ]}>
                Medication List
              </Text>
            </Pressable>
          </View>

          {/* Patient Header Card with Switcher */}
          <PatientCard
            patientName={selectedPatient?.name || 'Eleanor Johnson'}
            patientAge={selectedPatient?.age || 68}
            patientRole={selectedPatient?.role || 'Patient'}
            statusBadgeText={selectedPatient?.statusBadgeText || 'MONITORING ACTIVE'}
            patientsList={patients}
            selectedPatientId={selectedPatient?._id}
            onSelectPatient={handleSelectPatient}
          />

          {activeTab === 'oversight' ? (
            <>
              {/* Today's Timeline */}
              <View style={styles.timelineSection}>
                <Text style={styles.sectionTitle}>Today's Medication Timeline</Text>
                <View style={styles.timelineCard}>
                  {/* Item 1 */}
                  <View style={styles.timelineItem}>
                    <Text style={styles.timeLabel}>8:00 AM</Text>
                    <View style={styles.dotGreen} />
                    <View style={styles.medCol}>
                      <Text style={styles.timelineMedTitle}>Lisinopril 10mg</Text>
                      <Text style={styles.statusTaken}>Taken 8:05 AM</Text>
                    </View>
                  </View>

                  {/* Item 2 */}
                  <View style={styles.timelineItem}>
                    <Text style={styles.timeLabel}>8:00 AM</Text>
                    <View style={styles.dotGreen} />
                    <View style={styles.medCol}>
                      <Text style={styles.timelineMedTitle}>Atorvastatin 20mg</Text>
                      <Text style={styles.statusTaken}>Taken 8:10 AM</Text>
                    </View>
                  </View>

                  {/* Item 3 (Missed) */}
                  <View style={styles.timelineItem}>
                    <Text style={styles.timeLabel}>12:30 PM</Text>
                    <View style={styles.dotRed} />
                    <View style={styles.medCol}>
                      <Text style={styles.timelineMedTitle}>Metformin 500mg</Text>
                      <Text style={styles.statusMissed}>Missed</Text>
                    </View>
                  </View>

                  {/* Item 4 */}
                  <View style={styles.timelineItem}>
                    <Text style={styles.timeLabel}>6:00 PM</Text>
                    <View style={styles.dotGray} />
                    <View style={styles.medCol}>
                      <Text style={styles.timelineMedTitle}>Metformin 500mg</Text>
                      <Text style={styles.statusUpcoming}>Upcoming</Text>
                    </View>
                  </View>

                  {/* Item 5 */}
                  <View style={[styles.timelineItem, { borderBottomWidth: 0 }]}>
                    <Text style={styles.timeLabel}>9:00 PM</Text>
                    <View style={styles.dotGray} />
                    <View style={styles.medCol}>
                      <Text style={styles.timelineMedTitle}>Amlodipine 5mg</Text>
                      <Text style={styles.statusUpcoming}>Upcoming</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Vitals Signs */}
              <VitalSignsCard
                bloodPressure={selectedPatient?.vitals?.bloodPressure || '128/82'}
                heartRate={selectedPatient?.vitals?.heartRate || 72}
                bloodSugar={selectedPatient?.vitals?.bloodSugar || 145}
                onViewHistory={() => router.push('/history')}
              />
            </>
          ) : (
            /* Medication List View */
            <MedicationList
              onAddMedication={() => alert('Add Medication dialog opened!')}
              onEditSchedule={(med) => alert(`Edit schedule for ${med.name}`)}
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
  timelineSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  timelineCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timeLabel: {
    width: 65,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    marginRight: 12,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.alert,
    marginRight: 12,
  },
  dotGray: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.textMuted,
    marginRight: 12,
  },
  medCol: {
    flex: 1,
  },
  timelineMedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statusTaken: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.accent,
  },
  statusMissed: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.alert,
  },
  statusUpcoming: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
});
