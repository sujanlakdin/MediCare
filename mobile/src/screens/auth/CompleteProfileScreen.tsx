import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '../../components/auth/SafeScreen';
import Toast from '../../components/auth/Toast';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import { useAuth } from '../../contexts/auth-context';
import { apiRequest } from '../../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = [
  { id: 'Male', label: 'Male', icon: '👨' },
  { id: 'Female', label: 'Female', icon: '👩' },
  { id: 'Other', label: 'Other', icon: '👤' },
];
const RELATIONSHIPS = ['Spouse', 'Son', 'Daughter', 'Caregiver', 'Doctor', 'Other'];

export default function CompleteProfileScreen() {
  const { user, token, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '68');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [phone, setPhone] = useState(user?.phone || '');

  // Emergency contact fields
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(
    user?.emergencyContact?.relationship || 'Daughter'
  );
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Helper to sync DOB -> Age if year is entered
  const handleDobChange = (text: string) => {
    setDateOfBirth(text);
    const trimmed = text.trim();
    if (trimmed.length === 10 && trimmed.includes('-')) {
      const year = parseInt(trimmed.split('-')[0], 10);
      if (!isNaN(year) && year > 1900 && year < new Date().getFullYear()) {
        const calculatedAge = new Date().getFullYear() - year;
        setAge(String(calculatedAge));
      }
    }
  };

  const handleSaveAndContinue = async () => {
    if (!fullName.trim()) {
      showToast('Please confirm your full name');
      return;
    }

    setLoading(true);
    try {
      const numericAge = parseInt(age, 10);
      const payload: Record<string, any> = {
        fullName: fullName.trim(),
        age: !isNaN(numericAge) && numericAge > 0 ? numericAge : 65,
        gender,
        bloodGroup,
      };

      if (dateOfBirth.trim()) payload.dateOfBirth = dateOfBirth.trim();
      if (phone.trim()) payload.phone = phone.trim();

      if (emergencyName.trim() || emergencyPhone.trim()) {
        payload.emergencyContact = {
          name: emergencyName.trim(),
          relationship: emergencyRelationship,
          phone: emergencyPhone.trim(),
        };
      }

      // Update in backend
      await apiRequest('/api/users/profile', {
        method: 'PUT',
        token: token || undefined,
        body: payload,
      });

      // Update local AuthContext so real name and data show immediately on Dashboard
      updateUser({
        fullName: payload.fullName,
        age: payload.age,
        gender: payload.gender,
        bloodGroup: payload.bloodGroup,
        dateOfBirth: payload.dateOfBirth,
        phone: payload.phone,
        emergencyContact: payload.emergencyContact,
      });

      showToast('Profile completed successfully!');

      setTimeout(() => {
        router.replace('/(patient)/dashboard' as any);
      }, 500);
    } catch (err: any) {
      console.warn('Profile update error:', err);
      // Even if network or offline fallback, sync context and navigate
      updateUser({
        fullName: fullName.trim(),
        age: parseInt(age, 10) || 68,
        gender,
        bloodGroup,
        emergencyContact: {
          name: emergencyName.trim(),
          relationship: emergencyRelationship,
          phone: emergencyPhone.trim(),
        },
      });
      router.replace('/(patient)/dashboard' as any);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(patient)/dashboard' as any);
  };

  const firstName = fullName.trim() ? fullName.trim().split(' ')[0] : 'there';

  return (
    <SafeScreen backgroundColor={PATIENT_COLORS.brand} barStyle="light-content">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.badgeRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>ONBOARDING • STEP 2 OF 2</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {firstName}! Personalize your profile for tailored dosage schedules and emergency alerts.
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card 1: Personal Health Details */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👤</Text>
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={PATIENT_COLORS.ph}
                accessibilityLabel="Full name"
              />
            </View>

            {/* Age & Date of Birth row */}
            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="e.g. 72"
                  placeholderTextColor={PATIENT_COLORS.ph}
                  accessibilityLabel="Age in years"
                  maxLength={3}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1.5 }]}>
                <Text style={styles.fieldLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  value={dateOfBirth}
                  onChangeText={handleDobChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={PATIENT_COLORS.ph}
                  accessibilityLabel="Date of birth"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Gender Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {GENDERS.map((g) => {
                  const isSelected = gender === g.id;
                  return (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                      onPress={() => setGender(g.id)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={g.label}
                    >
                      <Text style={styles.genderIcon}>{g.icon}</Text>
                      <Text
                        style={[
                          styles.genderText,
                          isSelected && styles.genderTextSelected,
                        ]}
                      >
                        {g.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Card 2: Medical Info */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🩸</Text>
              <Text style={styles.sectionTitle}>Blood Group</Text>
            </View>
            <Text style={styles.fieldHelper}>
              Required for fast emergency medical response.
            </Text>

            <View style={styles.bloodGroupGrid}>
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = bloodGroup === bg;
                return (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodChip, isSelected && styles.bloodChipSelected]}
                    onPress={() => setBloodGroup(bg)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Blood group ${bg}`}
                  >
                    <Text
                      style={[
                        styles.bloodChipText,
                        isSelected && styles.bloodChipTextSelected,
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Phone Number */}
            <View style={[styles.fieldGroup, { marginTop: 14 }]}>
              <Text style={styles.fieldLabel}>Your Contact Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +94 77 123 4567"
                placeholderTextColor={PATIENT_COLORS.ph}
                keyboardType="phone-pad"
                accessibilityLabel="Phone number"
              />
            </View>
          </View>

          {/* Card 3: Emergency Contact */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🚨</Text>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
            </View>
            <View style={styles.alertNoticeBox}>
              <Text style={styles.alertNoticeText}>
                🛡️ This person is automatically notified if critical medication doses are missed.
              </Text>
            </View>

            {/* Emergency Contact Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contact Person Name</Text>
              <TextInput
                style={styles.input}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="e.g. Mary Perera"
                placeholderTextColor={PATIENT_COLORS.ph}
                accessibilityLabel="Emergency contact name"
              />
            </View>

            {/* Relationship Chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Relationship</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relationshipRow}
              >
                {RELATIONSHIPS.map((rel) => {
                  const isSelected = emergencyRelationship === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relChip,
                        isSelected && styles.relChipSelected,
                      ]}
                      onPress={() => setEmergencyRelationship(rel)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.relChipText,
                          isSelected && styles.relChipTextSelected,
                        ]}
                      >
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Emergency Phone */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Emergency Phone Number</Text>
              <TextInput
                style={styles.input}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="e.g. +94 77 987 6543"
                placeholderTextColor={PATIENT_COLORS.ph}
                keyboardType="phone-pad"
                accessibilityLabel="Emergency contact phone number"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSaveAndContinue}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Save profile and continue to dashboard"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save & Continue →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={loading}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Skip profile completion for now"
            >
              <Text style={styles.skipButtonText}>Skip for now (fill later)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast message={toastMessage} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  headerBanner: {
    backgroundColor: PATIENT_COLORS.brand,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F3F8F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2ECE6',
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F3D2E',
  },
  fieldHelper: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  fieldGroup: {
    marginTop: 12,
  },
  rowFields: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
  },
  genderChipSelected: {
    backgroundColor: '#E6F4EE',
    borderColor: PATIENT_COLORS.brand,
  },
  genderIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  genderTextSelected: {
    color: PATIENT_COLORS.brand,
    fontWeight: '700',
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodChip: {
    width: '22%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  bloodChipSelected: {
    backgroundColor: PATIENT_COLORS.brand,
    borderColor: PATIENT_COLORS.brand,
  },
  bloodChipText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  bloodChipTextSelected: {
    color: '#FFFFFF',
  },
  alertNoticeBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertNoticeText: {
    fontSize: 12.5,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
  relationshipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  relChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  relChipSelected: {
    backgroundColor: '#E6F4EE',
    borderColor: PATIENT_COLORS.brand,
  },
  relChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  relChipTextSelected: {
    color: PATIENT_COLORS.brand,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: PATIENT_COLORS.brand,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PATIENT_COLORS.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});
