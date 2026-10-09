import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Switch, Pressable, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';
import { patientApi, PatientItem } from '@/services/api';
import { downloadReport } from '@/services/reportGenerator';
import { EmergencyModal } from '@/components/caregiver/EmergencyModal';
import { ProfileEditModal, CaregiverProfileData } from '@/components/caregiver/ProfileEditModal';
import { caregiverProfileStore } from '@/services/caregiverProfileStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, switchRole, updateUser } = useAuth();

  const [missedAlerts, setMissedAlerts] = useState(true);
  const [refillReminders, setRefillReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(false);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState<boolean>(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'info' }>({
    message: '',
    visible: false,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfileData>(
    caregiverProfileStore.getProfile()
  );

  useEffect(() => {
    if (user) {
      caregiverProfileStore.syncFromUser(user);
    }
    setCaregiverProfile(caregiverProfileStore.getProfile());
    loadPatients();
    const unsubscribe = caregiverProfileStore.subscribe((updated) => {
      setCaregiverProfile(updated);
    });
    return () => unsubscribe();
  }, [user]);

  const loadPatients = async () => {
    try {
      const list = await patientApi.getPatients();
      const valid = list.filter((p) => !(p.role && p.role.toLowerCase() === 'caregiver'));
      setPatients(valid);
      if (valid.length > 0) {
        setSelectedPatientId(valid[0]._id);
      }
    } catch (err) {
      console.error('Failed to load linked patients in profile:', err);
    }
  };

  const activePatient = patients.find((p) => p._id === selectedPatientId) || patients[0] || {
    _id: 'default',
    name: 'Eleanor Johnson',
    age: 68,
  };

  const handleSelectPatient = (patient: PatientItem) => {
    setSelectedPatientId(patient._id);
    setDropdownOpen(false);
    Alert.alert(
      'Active Patient Selected 👤',
      `${patient.name} is now selected as your active patient.`
    );
  };

  const handleExportReport = () => {
    const mainPatient = patients.length > 0 ? patients[0].name : 'Eleanor Johnson';
    downloadReport({
      patientName: mainPatient,
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
      medications: [
        { name: 'Lisinopril 10mg', percent: 95 },
        { name: 'Atorvastatin 20mg', percent: 90 },
        { name: 'Metformin 500mg', percent: 75 },
      ],
    });

    Alert.alert(
      'Caregiver Report Exported! 📄',
      `Comprehensive monitoring PDF summary for ${mainPatient} has been downloaded.`
    );
  };

  const handleShowEmergencyInfo = () => {
    setEmergencyModalVisible(true);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/splash');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.pageTitle}>Profile & Settings</Text>
            <Text style={styles.pageSub}>
              Logged in as {user?.role ? user.role.toUpperCase() : 'CAREGIVER'}
            </Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{
                  uri: caregiverProfile.avatarUrl,
                }}
                style={styles.avatar}
              />
              <Pressable
                style={styles.avatarEditBadge}
                onPress={() => setEditProfileModalVisible(true)}>
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.caregiverName}>{caregiverProfile.name}</Text>
              <Text style={styles.roleTitle}>{caregiverProfile.role} • {caregiverProfile.age} yrs</Text>
              <Text style={styles.emailText}>{caregiverProfile.email}</Text>
            </View>
            <Pressable
              style={styles.editProfileBtn}
              onPress={() => setEditProfileModalVisible(true)}>
              <Ionicons name="create-outline" size={18} color={Colors.light.primary} />
            </Pressable>
          </View>

          {/* Linked Patients Dropdown */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Linked Patients</Text>

            {/* Dropdown Trigger Header */}
            <Pressable
              style={styles.dropdownHeaderCard}
              onPress={() => setDropdownOpen(!dropdownOpen)}>
              <Image
                source={{
                  uri: (activePatient as any).avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                }}
                style={styles.patientAvatar}
              />
              <View style={styles.patientInfoCol}>
                <Text style={styles.patientName}>{activePatient.name}</Text>
                <Text style={styles.patientSub}>Age {activePatient.age || 68} • Patient</Text>
              </View>
              <View style={styles.dropdownBadgeRow}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
                <Ionicons
                  name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
            </Pressable>

            {/* Expanded Dropdown List */}
            {dropdownOpen && (
              <View style={styles.dropdownListContainer}>
                {patients.length > 0 ? (
                  patients.map((patient) => {
                    const isSelected = patient._id === selectedPatientId;
                    return (
                      <View
                        key={patient._id || patient.name}
                        style={[
                          styles.dropdownItemContainer,
                          isSelected && styles.dropdownItemActiveContainer,
                        ]}>
                        <Pressable
                          style={styles.dropdownItemRow}
                          onPress={() => handleSelectPatient(patient)}>
                          <Image
                            source={{
                              uri: patient.avatarUrl || (patient as any).avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                            }}
                            style={styles.patientAvatarSmall}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.patientNameSmall}>{patient.name}</Text>
                            <Text style={styles.patientSubSmall}>
                              Age {patient.age || 68} • {patient.bloodGroup ? `Blood ${patient.bloodGroup}` : 'Patient'}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.selectedBadgeWrap}>
                              <Ionicons name="checkmark-circle" size={20} color={Colors.light.primary} />
                            </View>
                          )}
                        </Pressable>

                        {/* Rich Patient Details Snippet */}
                        <View style={styles.patientDetailsSnippet}>
                          <View style={styles.detailTagRow}>
                            <View style={styles.detailTag}>
                              <Ionicons name="medical" size={12} color={Colors.light.primary} />
                              <Text style={styles.detailTagText}>
                                {patient.primaryDiagnosis || 'Hypertension & Type 2 Diabetes'}
                              </Text>
                            </View>
                            <View style={[styles.detailTag, { backgroundColor: '#FEE2E2' }]}>
                              <Ionicons name="warning" size={12} color="#DC2626" />
                              <Text style={[styles.detailTagText, { color: '#DC2626' }]}>
                                {patient.allergies || 'Penicillin'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.vitalsRow}>
                            <Text style={styles.vitalText}>
                              🩺 BP: <Text style={styles.vitalVal}>{patient.vitals?.bloodPressure || '128/82'}</Text>
                            </Text>
                            <Text style={styles.vitalText}>
                              💓 HR: <Text style={styles.vitalVal}>{patient.vitals?.heartRate || 72} bpm</Text>
                            </Text>
                            <Text style={styles.vitalText}>
                              📞 Phone: <Text style={styles.vitalVal}>{patient.phone || '0701982984'}</Text>
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.dropdownItemRow}>
                    <Text style={styles.patientSubSmall}>No other linked patients found.</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Notification Preferences */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Notification Preferences</Text>
            <View style={styles.preferencesCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Missed Dose Alerts</Text>
                <Switch
                  value={missedAlerts}
                  onValueChange={(val) => {
                    setMissedAlerts(val);
                    showToast(
                      val ? 'Missed Dose Alerts Turned ON 🚨' : 'Missed Dose Alerts Turned OFF 🔕',
                      val ? 'success' : 'info'
                    );
                  }}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Refill Reminders</Text>
                <Switch
                  value={refillReminders}
                  onValueChange={(val) => {
                    setRefillReminders(val);
                    showToast(
                      val ? 'Refill Reminders Turned ON 💊' : 'Refill Reminders Turned OFF 🔕',
                      val ? 'success' : 'info'
                    );
                  }}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Daily Summary</Text>
                <Switch
                  value={dailySummary}
                  onValueChange={(val) => {
                    setDailySummary(val);
                    showToast(
                      val ? 'Daily Summary Turned ON 📊' : 'Daily Summary Turned OFF 🔕',
                      val ? 'success' : 'info'
                    );
                  }}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>

              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.toggleLabel}>Appointment Reminders</Text>
                <Switch
                  value={appointmentReminders}
                  onValueChange={(val) => {
                    setAppointmentReminders(val);
                    showToast(
                      val ? 'Appointment Reminders Turned ON 📅' : 'Appointment Reminders Turned OFF 🔕',
                      val ? 'success' : 'info'
                    );
                  }}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => {
                  Linking.openURL('tel:0701982984').catch(() =>
                    Alert.alert('Contacting Doctor', 'Dialing Primary Doctor (070 198 2984)...')
                  );
                }}>
                <Ionicons name="call-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.actionBtnText}>Contact Doctor</Text>
              </Pressable>

              <Pressable style={styles.actionBtn} onPress={handleShowEmergencyInfo}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.actionBtnText}>Emergency Info</Text>
              </Pressable>

              <Pressable style={styles.actionBtn} onPress={handleExportReport}>
                <Ionicons name="download-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.actionBtnText}>Export Reports</Text>
              </Pressable>
            </View>
          </View>

          {/* Log Out Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.alert} />
            <Text style={styles.logoutBtnText}>Log Out Account</Text>
          </TouchableOpacity>

          {/* Version Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.versionText}>CareRx v2.1.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Emergency Info Modal */}
      <EmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
        patientName={activePatient.name}
      />

      {/* Caregiver Profile Edit Modal */}
      <ProfileEditModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        initialData={caregiverProfile}
        onSave={(updatedData) => {
          setCaregiverProfile(updatedData);
          caregiverProfileStore.updateProfile(updatedData);
          if (updateUser) {
            updateUser({
              fullName: updatedData.name,
              email: updatedData.email,
              phone: updatedData.phone,
            });
          }
        }}
        onDelete={() => {
          const defaultData = {
            name: 'Kasun Perera',
            age: '32',
            role: 'Primary Caregiver',
            email: 'kasun1234@gmail.com',
            phone: '0701982984',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          };
          setCaregiverProfile(defaultData);
          caregiverProfileStore.updateProfile(defaultData);
          Alert.alert('Profile Reset! 🗑️', 'Caregiver profile details have been reset to default.');
        }}
      />

      {/* Floating Toast Notification Banner */}
      {toast.visible && (
        <View style={styles.toastContainer}>
          <View style={[styles.toastBanner, toast.type === 'info' && styles.toastBannerInfo]}>
            <Ionicons
              name={toast.type === 'success' ? 'notifications' : 'notifications-off'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        </View>
      )}
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
  profileCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.light.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editProfileBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#E6F4EA',
    marginLeft: 'auto',
  },
  profileTextCol: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 2,
  },
  emailText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 10,
  },
  dropdownHeaderCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  dropdownBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownListContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    marginTop: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#F1F9F6',
  },
  patientAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  patientNameSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  patientSubSmall: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  patientCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  patientInfoCol: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  patientSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  activeBadge: {
    backgroundColor: '#E6F4EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  preferencesCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.alertBg,
    borderWidth: 1,
    borderColor: Colors.light.alertBorder,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.alert,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  dropdownItemContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownItemActiveContainer: {
    backgroundColor: '#E6F4EE',
    borderColor: Colors.light.primary,
  },
  selectedBadgeWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientDetailsSnippet: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    gap: 6,
  },
  detailTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  detailTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  vitalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 2,
  },
  vitalText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  vitalVal: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669', // Emerald success green
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastBannerInfo: {
    backgroundColor: '#475569', // Slate info grey
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
