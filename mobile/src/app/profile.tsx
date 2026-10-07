import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Image, Switch, Pressable, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [missedAlerts, setMissedAlerts] = useState(true);
  const [refillReminders, setRefillReminders] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/splash' as any);
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
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
              }}
              style={styles.avatar}
            />
            <View style={styles.profileTextCol}>
              <Text style={styles.caregiverName}>{user?.fullName || 'Sarah Mitchell'}</Text>
              <Text style={styles.roleTitle}>
                {user?.role === 'patient' ? 'Patient' : 'Primary Caregiver'}
              </Text>
              <Text style={styles.emailText}>{user?.email || 'sarah.mitchell@email.com'}</Text>
            </View>
          </View>

          {/* Linked Patients */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Linked Patients</Text>
            <View style={styles.patientCard}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                }}
                style={styles.patientAvatar}
              />
              <View style={styles.patientInfoCol}>
                <Text style={styles.patientName}>Eleanor Johnson</Text>
                <Text style={styles.patientSub}>Age 68 • Patient</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
          </View>

          {/* Notification Preferences */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Notification Preferences</Text>
            <View style={styles.preferencesCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Missed Dose Alerts</Text>
                <Switch
                  value={missedAlerts}
                  onValueChange={setMissedAlerts}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Refill Reminders</Text>
                <Switch
                  value={refillReminders}
                  onValueChange={setRefillReminders}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Daily Summary</Text>
                <Switch
                  value={dailySummary}
                  onValueChange={setDailySummary}
                  trackColor={{ false: '#CBD5E1', true: Colors.light.accent }}
                />
              </View>

              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.toggleLabel}>Appointment Reminders</Text>
                <Switch
                  value={appointmentReminders}
                  onValueChange={setAppointmentReminders}
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
                  Linking.openURL('tel:+15550199999').catch(() =>
                    Alert.alert('Contacting Doctor', 'Dialing Dr. Patel (+1 555-019-9999)...')
                  );
                }}>
                <Ionicons name="call-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.actionBtnText}>Contact Doctor</Text>
              </Pressable>

              <Pressable
                style={styles.actionBtn}
                onPress={() => alert('Emergency Information details...')}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.light.primary} />
                <Text style={styles.actionBtnText}>Emergency Info</Text>
              </Pressable>

              <Pressable
                style={styles.actionBtn}
                onPress={() => alert('Exporting full Caregiver report PDF...')}>
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
});
