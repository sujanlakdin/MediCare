import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function ReminderNotificationScreen() {
  const router = useRouter();

  // Local state for tracking snoozes remaining (initial: 2)
  const [snoozesRemaining, setSnoozesRemaining] = useState<number>(2);

  const handleMarkAsTaken = () => {
    router.push('/mark-as-taken' as any);
  };

  const handleSnooze = () => {
    if (snoozesRemaining > 0) {
      const nextCount = snoozesRemaining - 1;
      setSnoozesRemaining(nextCount);
      Alert.alert(
        'Reminder Snoozed',
        `Snoozed for 15 minutes. ${nextCount} ${
          nextCount === 1 ? 'snooze' : 'snoozes'
        } remaining.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'No Snoozes Remaining',
        'You have reached the maximum number of snoozes for this dose.'
      );
    }
  };

  const handleSkipDose = () => {
    router.back();
  };

  const handleMoreOptions = () => {
    Alert.alert('Reminder Options', 'Manage reminder settings for Lisinopril.', [
      { text: 'View Prescription', onPress: () => router.push('/medication-schedule' as any) },
      { text: 'Mute for Today', style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleCareTeamHelp = () => {
    Alert.alert(
      'Care Team Support',
      'Need assistance with your medication regimen? You can reach your healthcare provider directly.',
      [
        { text: 'Call Care Team', onPress: () => {} },
        { text: 'Dismiss', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Hide Expo Router's auto tabs & default header title */}
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false, title: '' }} />
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      {/* Screen Header matching design */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color="#154D38" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reminders</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleMoreOptions}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="More options"
          accessibilityRole="button">
          <Ionicons name="ellipsis-horizontal" size={22} color="#154D38" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Main White Card */}
          <View style={styles.cardContainer}>
            {/* Notification Header Row */}
            <View style={styles.notificationHeader}>
              <View style={styles.bellIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#10B981" />
              </View>
              <View style={styles.notificationHeaderText}>
                <Text style={styles.headingTitle}>Time for your meds</Text>
                <Text style={styles.headingSub}>Scheduled for 8:00 AM</Text>
              </View>
            </View>

            {/* Inner Medication Box */}
            <View style={styles.medicationCard}>
              <Text style={styles.fieldLabel}>MEDICATION</Text>
              <Text style={styles.medName}>Lisinopril</Text>
              <Text style={styles.medDosage}>10 mg Tablet</Text>

              <Text style={[styles.fieldLabel, styles.instructionsLabel]}>INSTRUCTIONS</Text>
              <Text style={styles.instructionsText}>
                Take 1 tablet by mouth with a full glass of water. Best taken on an empty stomach.
              </Text>
            </View>

            {/* Meta Rows */}
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={18} color="#64748B" />
              <Text style={styles.metaText}>
                {snoozesRemaining} {snoozesRemaining === 1 ? 'snooze' : 'snoozes'} remaining
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={18} color="#64748B" />
              <Text style={styles.metaText}>Next: Tomorrow 8:00 AM</Text>
            </View>

            {/* Mark as Taken Button */}
            <TouchableOpacity
              style={styles.takenButton}
              onPress={handleMarkAsTaken}
              activeOpacity={0.88}
              accessibilityLabel="Mark as Taken"
              accessibilityRole="button">
              <Ionicons name="checkmark" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.takenButtonText}>Mark as Taken</Text>
            </TouchableOpacity>

            {/* Secondary Buttons: Snooze 15m & Skip Dose */}
            <View style={styles.secondaryButtonRow}>
              <TouchableOpacity
                style={[
                  styles.snoozeButton,
                  snoozesRemaining === 0 && styles.snoozeButtonDisabled,
                ]}
                onPress={handleSnooze}
                activeOpacity={0.8}
                disabled={snoozesRemaining === 0}
                accessibilityLabel="Snooze 15 minutes"
                accessibilityRole="button">
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={snoozesRemaining === 0 ? '#94A3B8' : '#154D38'}
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.snoozeButtonText,
                    snoozesRemaining === 0 && styles.snoozeButtonTextDisabled,
                  ]}>
                  Snooze 15m
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipDose}
                activeOpacity={0.8}
                accessibilityLabel="Skip Dose"
                accessibilityRole="button">
                <Ionicons name="close" size={18} color="#DC2626" style={styles.buttonIcon} />
                <Text style={styles.skipButtonText}>Skip Dose</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Care Team Help Link */}
          <TouchableOpacity
            style={styles.helpRow}
            onPress={handleCareTeamHelp}
            activeOpacity={0.7}
            accessibilityLabel="Contact your care team"
            accessibilityRole="button">
            <Ionicons name="information-circle-outline" size={16} color="#64748B" />
            <Text style={styles.helpText}>Need help? Contact your care team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Home Indicator bar */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3FAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F3FAF7',
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#154D38',
    letterSpacing: -0.2,
  },
  scrollContent: {
    backgroundColor: '#F3FAF7',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  bellIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notificationHeaderText: {
    flex: 1,
  },
  headingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headingSub: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  medicationCard: {
    backgroundColor: '#F2F7F4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A6054',
    letterSpacing: 0.6,
  },
  instructionsLabel: {
    marginTop: 14,
  },
  medName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#154D38',
    marginTop: 3,
    letterSpacing: -0.3,
  },
  medDosage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  instructionsText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#334155',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 8,
  },
  takenButton: {
    backgroundColor: '#0B5D3D',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#0B5D3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  takenButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  snoozeButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E6F4EE',
    borderWidth: 1,
    borderColor: '#D2E6DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  snoozeButtonText: {
    color: '#154D38',
    fontSize: 14,
    fontWeight: '700',
  },
  snoozeButtonTextDisabled: {
    color: '#94A3B8',
  },
  skipButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 6,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 8,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 6,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 4 : 8,
  },
});
