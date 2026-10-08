import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PatientCard } from '@/components/caregiver/PatientCard';
import { CircularGauge } from '@/components/caregiver/CircularGauge';
import { WeeklyChart } from '@/components/caregiver/WeeklyChart';
import { HealthScoreCard } from '@/components/caregiver/HealthScoreCard';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { downloadReport } from '@/services/reportGenerator';
import { patientApi, medicationApi, PatientItem, MedicationItem } from '@/services/api';

export default function ReportsScreen() {
  const router = useRouter();
  const [reportTab, setReportTab] = useState<'adherence' | 'progress'>('adherence');

  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const list = await patientApi.getPatients();
      const valid = list.filter((p) => !(p.role && p.role.toLowerCase() === 'caregiver'));
      setPatients(valid);
      if (valid.length > 0) {
        setSelectedPatientId(valid[0]._id);
        fetchMedicationsForPatient(valid[0]._id);
      }
    } catch (err) {
      console.error('Failed to load patients for reports:', err);
    }
  };

  const fetchMedicationsForPatient = async (patientId: string) => {
    try {
      setLoading(true);
      const meds = await medicationApi.getMedications(patientId);
      setMedications(meds);
    } catch (err) {
      console.error('Failed to fetch medications for reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    fetchMedicationsForPatient(id);
  };

  const selectedPatient = patients.find((p) => p._id === selectedPatientId) || patients[0];

  const handleDownloadReport = () => {
    const name = selectedPatient?.name || 'Eleanor Johnson';
    downloadReport({
      patientName: name,
      patientAge: selectedPatient?.age || 68,
      patientRole: 'Patient',
      statusBadgeText: 'MONITORING ACTIVE',
      overallAdherence: 85,
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
      medications: medications.length > 0
        ? medications.map((m) => ({ name: `${m.name} ${m.dosage || ''}`.trim(), percent: 90 }))
        : [
            { name: 'Lisinopril 10mg', percent: 95 },
            { name: 'Atorvastatin 20mg', percent: 90 },
            { name: 'Metformin 500mg', percent: 75 },
            { name: 'Amlodipine 5mg', percent: 88 },
          ],
    });

    Alert.alert(
      'Report Downloaded! 📄',
      `Adherence summary report for ${name} has been generated successfully.`
    );
  };

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
              {/* Dynamic Patient Switcher Card */}
              <PatientCard
                patientName={selectedPatient?.name || 'Eleanor Johnson'}
                patientAge={selectedPatient?.age || 68}
                patientRole="Patient"
                statusBadgeText="MONITORING ACTIVE"
                patientsList={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(p) => handleSelectPatient(p._id)}
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

              {/* Weekly Activity Bar Chart. */}
              <WeeklyChart />

              {/* By Medication List */}
              <View style={styles.byMedCard}>
                <Text style={styles.cardTitle}>By Medication</Text>
                
                {medications.length > 0 ? (
                  medications.map((m, idx) => (
                    <View key={m._id || idx} style={styles.medProgressRow}>
                      <View style={styles.medLabelRow}>
                        <Text style={styles.medName}>{m.name} {m.dosage || ''}</Text>
                        <Text style={styles.medPercent}>
                          {m.status === 'taken' ? '100%' : m.status === 'missed' ? '50%' : '90%'}
                        </Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: m.status === 'taken' ? '100%' : m.status === 'missed' ? '50%' : '90%',
                              backgroundColor: m.status === 'missed' ? Colors.light.warning : Colors.light.accent,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.medProgressRow}>
                      <View style={styles.medLabelRow}>
                        <Text style={styles.medName}>Lisinopril 10mg</Text>
                        <Text style={styles.medPercent}>95%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '95%' }]} />
                      </View>
                    </View>

                    <View style={styles.medProgressRow}>
                      <View style={styles.medLabelRow}>
                        <Text style={styles.medName}>Atorvastatin 20mg</Text>
                        <Text style={styles.medPercent}>90%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '90%' }]} />
                      </View>
                    </View>

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

                    <View style={styles.medProgressRow}>
                      <View style={styles.medLabelRow}>
                        <Text style={styles.medName}>Amlodipine 5mg</Text>
                        <Text style={styles.medPercent}>88%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: '88%' }]} />
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Monthly Trend Visual Breakdown */}
              <View style={styles.monthlyTrendCard}>
                <Text style={styles.cardTitle}>Monthly Trend</Text>
                <Text style={styles.trendSub}>Consistent improvement over 4 weeks</Text>

                <View style={{ gap: 10, marginTop: 10 }}>
                  {[
                    { week: 'Week 1', percent: 78, status: 'Good' },
                    { week: 'Week 2', percent: 82, status: 'Great' },
                    { week: 'Week 3', percent: 80, status: 'Consistent' },
                    { week: 'Week 4', percent: 88, status: 'Excellent' },
                  ].map((w, idx) => (
                    <View key={idx}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.weekLabel}>{w.week} — <Text style={{ color: Colors.light.accent, fontWeight: '600' }}>{w.status}</Text></Text>
                        <Text style={styles.weekPercent}>{w.percent}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${w.percent}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <Pressable
                style={styles.downloadBtn}
                onPress={handleDownloadReport}>
                <Ionicons name="download-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.downloadBtnText}>Download Report PDF</Text>
              </Pressable>
            </>
          ) : (
            /* Patient Progress (Health Journey View) */
            <HealthScoreCard
              score={88}
              statusText="Excellent — Stable"
              patientName={selectedPatient?.name || 'Eleanor Johnson'}
              patientAge={selectedPatient?.age || 68}
              patientsList={patients}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(p) => handleSelectPatient(p._id)}
              onViewCompleteHistory={() => router.push('/(caregiver)/history')}
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
    paddingBottom: 100,
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
  weekLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  weekPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  downloadBtn: {
    flexDirection: 'row',
    gap: 8,
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
