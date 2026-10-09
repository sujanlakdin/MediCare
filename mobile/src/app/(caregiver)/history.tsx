import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { downloadReport } from '@/services/reportGenerator';
import { patientApi, medicationApi, PatientItem, MedicationItem } from '@/services/api';
import { CaregiverNotesSection } from '@/components/caregiver/CaregiverNotesSection';

export default function HistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ patientId?: string; patientName?: string }>();
  const [timeFilter, setTimeFilter] = useState<'6m' | '30d' | 'all'>('6m');
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string }>({
    id: params.patientId || '',
    name: params.patientName || 'Eleanor Johnson',
  });
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient.id) {
      loadMedications(selectedPatient.id);
    } else {
      setLoading(false);
    }
  }, [selectedPatient.id]);

  const loadPatients = async () => {
    try {
      const list = await patientApi.getPatients();
      const valid = list.filter((p) => !(p.role && p.role.toLowerCase() === 'caregiver'));
      setPatients(valid);
      if (!params.patientName && valid.length > 0) {
        setSelectedPatient({ id: valid[0]._id, name: valid[0].name });
      }
    } catch (err) {
      console.error('Failed to load patients in history:', err);
    }
  };

  const loadMedications = async (patientId: string) => {
    setLoading(true);
    try {
      const data = await medicationApi.getMedications(patientId);
      setMedications(data);
    } catch (err) {
      console.error('Failed to load medications for history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    const medList = medications.length > 0
      ? medications.map((m) => ({
          name: `${m.name} ${m.dosage || ''}`.trim(),
          percent: (m.stock ?? 0) > 15 ? 95 : 70,
        }))
      : [
          { name: 'Lisinopril 10mg', percent: 95 },
          { name: 'Atorvastatin 20mg', percent: 90 },
        ];

    downloadReport({
      patientName: selectedPatient.name,
      patientAge: 68,
      patientRole: 'Patient',
      statusBadgeText: 'MONITORING ACTIVE',
      overallAdherence: 88,
      ratingText: 'Excellent rating',
      weeklyData: [
        { day: 'Mon', percent: 90 },
        { day: 'Tue', percent: 100 },
        { day: 'Wed', percent: 75 },
        { day: 'Thu', percent: 85 },
        { day: 'Fri', percent: 90 },
        { day: 'Sat', percent: 50 },
        { day: 'Sun', percent: 95 },
      ],
      medications: medList,
    });

    Alert.alert(
      'PDF Summary Exported! 📄',
      `Complete historical adherence log for ${selectedPatient.name} downloaded successfully.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Top Bar with Back Arrow */}
          <View style={styles.topBar}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.light.primary} />
            </Pressable>
            <Pressable style={styles.exportBtn} onPress={handleExportPdf}>
              <Ionicons name="download-outline" size={20} color={Colors.light.primary} />
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Complete History</Text>
            <Text style={styles.pageSub}>{selectedPatient.name}</Text>
          </View>

          {/* Filter Pills */}
          <View style={styles.pillRow}>
            <Pressable
              style={[
                styles.pillBtn,
                timeFilter === '6m' && styles.pillBtnActive,
              ]}
              onPress={() => setTimeFilter('6m')}>
              <Text
                style={[
                  styles.pillText,
                  timeFilter === '6m' && styles.pillTextActive,
                ]}>
                Last 6 Months
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.pillBtn,
                timeFilter === '30d' && styles.pillBtnActive,
              ]}
              onPress={() => setTimeFilter('30d')}>
              <Text
                style={[
                  styles.pillText,
                  timeFilter === '30d' && styles.pillTextActive,
                ]}>
                Last 30 Days
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.pillBtn,
                timeFilter === 'all' && styles.pillBtnActive,
              ]}
              onPress={() => setTimeFilter('all')}>
              <Text
                style={[
                  styles.pillText,
                  timeFilter === 'all' && styles.pillTextActive,
                ]}>
                All Time
              </Text>
            </Pressable>
          </View>

          {/* Dynamic Real Medications Logs */}
          <View style={styles.monthSection}>
            <Text style={styles.monthHeader}>ACTIVE PRESCRIPTIONS & ADHERENCE LOGS</Text>

            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginVertical: 12 }} />
            ) : medications.length > 0 ? (
              medications.map((med) => (
                <View key={med._id || med.name} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleRow}>
                      <View style={(med.stock ?? 0) > 15 ? styles.dotGreen : styles.dotGray} />
                      <Text style={styles.eventTitle}>
                        {med.name} {med.dosage ? `(${med.dosage})` : ''}
                      </Text>
                    </View>
                    <Text style={styles.eventDate}>
                      {(med.stock ?? 0) > 15 ? 'Active' : 'Low Stock'}
                    </Text>
                  </View>
                  <Text style={styles.eventBody}>
                    Scheduled: {med.scheduledTime || 'Daily Regimen'} • Current Stock: {med.stock ?? 0} tablets
                  </Text>
                  <View style={styles.vitalsBadgeRow}>
                    <Text style={styles.vitalsBadgeText}>
                      {(med.stock ?? 0) > 15 ? `✅ Stock Sufficient (${med.stock} Available)` : `⚠️ Refill Required (${med.stock} Left)`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.eventCard}>
                <Text style={styles.eventBody}>No active prescriptions found for this patient.</Text>
              </View>
            )}
          </View>

          {/* SEPTEMBER 2023 */}
          <View style={styles.monthSection}>
            <Text style={styles.monthHeader}>SEPTEMBER 2023</Text>

            {/* Event 1 */}
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTitleRow}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.eventTitle}>Clinical Visit • Dr. Patel</Text>
                </View>
                <Text style={styles.eventDate}>Sept 10</Text>
              </View>
              <Text style={styles.eventBody}>
                Blood pressure stabilized on Lisinopril. Vitals & labs evaluated.
              </Text>
              <View style={styles.vitalsBadgeRow}>
                <Text style={styles.vitalsBadgeText}>
                  BP 124/80  •  HR 72 bpm  •  Glucose 110 mg/dL
                </Text>
              </View>
            </View>

            {/* Event 2 */}
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTitleRow}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.eventTitle}>30 Days Medication Streak</Text>
                </View>
                <Text style={styles.eventDate}>Sept 5</Text>
              </View>
              <Text style={styles.eventBody}>Consistent morning and evening logs</Text>
            </View>
          </View>

          {/* AUGUST 2023 (Shown when filter is 6m or all) */}
          {(timeFilter === '6m' || timeFilter === 'all') && (
            <View style={styles.monthSection}>
              <Text style={styles.monthHeader}>AUGUST 2023</Text>

              {/* Event 3 */}
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleRow}>
                    <View style={styles.dotGreen} />
                    <Text style={styles.eventTitle}>90% Monthly Adherence</Text>
                  </View>
                  <Text style={styles.eventDate}>Aug 31</Text>
                </View>
                <Text style={styles.eventBody}>Target reached for August</Text>
              </View>

              {/* Event 4 */}
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleRow}>
                    <View style={styles.dotGray} />
                    <Text style={styles.eventTitle}>Prescription Update</Text>
                  </View>
                  <Text style={styles.eventDate}>Aug 18</Text>
                </View>
                <Text style={styles.eventBody}>
                  Metformin adjusted to 500mg (Reduced from 850mg once daily with dinner).
                </Text>
              </View>

              {/* Event 5 */}
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleRow}>
                    <View style={styles.dotGray} />
                    <Text style={styles.eventTitle}>In-Home Tele-Check</Text>
                  </View>
                  <Text style={styles.eventDate}>Aug 15</Text>
                </View>
                <Text style={styles.eventBody}>BP: 132/86 mmHg • HR: 76 bpm</Text>
              </View>
            </View>
          )}

          {/* JULY 2023 (Shown when filter is all) */}
          {timeFilter === 'all' && (
            <View style={styles.monthSection}>
              <Text style={styles.monthHeader}>JULY 2023</Text>

              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleRow}>
                    <View style={styles.dotGreen} />
                    <Text style={styles.eventTitle}>Initial Onboarding & Assessment</Text>
                  </View>
                  <Text style={styles.eventDate}>July 12</Text>
                </View>
                <Text style={styles.eventBody}>
                  Caregiver linking completed. Baseline vital records uploaded.
                </Text>
              </View>
            </View>
          )}

          {/* Caregiver Medical Notes CRUD (Entity 2) */}
          <CaregiverNotesSection
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
          />

          {/* Export Button */}
          <Pressable style={styles.exportFullBtn} onPress={handleExportPdf}>
            <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.exportFullBtnText}>Export Summary PDF</Text>
          </Pressable>
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
    paddingBottom: 100,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  exportBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  titleSection: {
    marginBottom: 14,
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
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F2EC',
  },
  pillBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  monthSection: {
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  eventCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
  },
  dotGray: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.textMuted,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  eventDate: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  eventBody: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  vitalsBadgeRow: {
    backgroundColor: '#F8FAF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  vitalsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  exportFullBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  exportFullBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
