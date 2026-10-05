import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Switch,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function ReminderSetupScreen() {
  const router = useRouter();

  // Local state for mock data and working snooze toggle
  const [isSnoozeEnabled, setIsSnoozeEnabled] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<string>('08:30 AM');
  const [frequency, setFrequency] = useState<string>('Every Day');
  const [startDate, setStartDate] = useState<string>('Today, Oct 24');
  const [notificationSound, setNotificationSound] = useState<string>('Morning Dew');
  const [instructions, setInstructions] = useState<string>(
    'Take with a full glass of water. Can be taken with or without food.'
  );

  const handleEditMedication = () => {
    Alert.alert(
      'Edit Medication',
      'Change medication details for Lisinopril 10 mg Tablet.',
      [{ text: 'OK' }]
    );
  };

  const handleTimePress = () => {
    Alert.alert(
      'Schedule Time',
      `Current reminder time is set to ${selectedTime}.`,
      [
        { text: '08:00 AM', onPress: () => setSelectedTime('08:00 AM') },
        { text: '08:30 AM', onPress: () => setSelectedTime('08:30 AM') },
        { text: '09:00 AM', onPress: () => setSelectedTime('09:00 AM') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFrequencyPress = () => {
    Alert.alert(
      'Reminder Frequency',
      `Current frequency is set to ${frequency}.`,
      [
        { text: 'Every Day', onPress: () => setFrequency('Every Day') },
        { text: 'Weekdays Only', onPress: () => setFrequency('Weekdays Only') },
        { text: 'Every 2 Days', onPress: () => setFrequency('Every 2 Days') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDatePress = () => {
    Alert.alert(
      'Start Date',
      `Reminder starts from ${startDate}.`,
      [
        { text: 'Today, Oct 24', onPress: () => setStartDate('Today, Oct 24') },
        { text: 'Tomorrow, Oct 25', onPress: () => setStartDate('Tomorrow, Oct 25') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSoundPress = () => {
    Alert.alert(
      'Notification Sound',
      `Current tone: ${notificationSound}`,
      [
        { text: 'Morning Dew', onPress: () => setNotificationSound('Morning Dew') },
        { text: 'Gentle Chime', onPress: () => setNotificationSound('Gentle Chime') },
        { text: 'Classic Bell', onPress: () => setNotificationSound('Classic Bell') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Setup Reminder Help',
      'Customize your dose alerts, sound preferences, and snooze intervals to stay on track with your prescription regimen.'
    );
  };

  const handleSaveReminder = () => {
    Alert.alert(
      'Reminder Saved',
      `Reminder for Lisinopril scheduled for ${selectedTime} (${frequency}). Snooze is ${
        isSnoozeEnabled ? 'enabled (15 min)' : 'disabled'
      }.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Hide Expo Router's auto tabs & default header title */}
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false, title: '' }} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#154D38" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Setup Reminder</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleHelpPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Medication Summary Card */}
          <View style={styles.medicationCard}>
            <View style={styles.medicationLeft}>
              <View style={styles.pillIconContainer}>
                <MaterialCommunityIcons name="pill" size={26} color="#10B981" />
              </View>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>Lisinopril</Text>
                <Text style={styles.medicationDosage}>10 mg Tablet</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditMedication}
              activeOpacity={0.7}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SCHEDULE</Text>

            {/* Time Row */}
            <TouchableOpacity
              style={styles.itemCard}
              onPress={handleTimePress}
              activeOpacity={0.7}>
              <Ionicons name="time-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>{selectedTime}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Frequency Row */}
            <TouchableOpacity
              style={styles.itemCard}
              onPress={handleFrequencyPress}
              activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>{frequency}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Date Row */}
            <TouchableOpacity
              style={styles.itemCard}
              onPress={handleDatePress}
              activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>{startDate}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Notification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>NOTIFICATION</Text>

            {/* Sound Row */}
            <TouchableOpacity
              style={styles.itemCard}
              onPress={handleSoundPress}
              activeOpacity={0.7}>
              <Ionicons name="volume-medium-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>{notificationSound}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Snooze Row with Working Toggle */}
            <View style={styles.itemCard}>
              <Ionicons name="moon-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>Enable Snooze (15 min)</Text>
              <Switch
                value={isSnoozeEnabled}
                onValueChange={setIsSnoozeEnabled}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          {/* Instructions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>INSTRUCTIONS</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsText}>{instructions}</Text>
            </View>
          </View>

          {/* Missed Dose Protocol Alert Box */}
          <View style={styles.alertCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={Colors.light.alert}
              style={styles.alertIcon}
            />
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Missed Dose Protocol</Text>
              <Text style={styles.alertDescription}>
                If you miss a dose, take it as soon as you remember. If it is near the time of the
                next dose, skip the missed dose.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Docked Save Reminder Button Container */}
      <View style={styles.bottomDockContainer}>
        <View style={styles.bottomDockWrapper}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveReminder}
            activeOpacity={0.88}>
            <Text style={styles.saveButtonText}>Save Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
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
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  medicationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 13,
    color: '#64748B',
  },
  editButton: {
    backgroundColor: '#E6F4EE',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 12,
    flex: 1,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    padding: 16,
    minHeight: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 18,
  },
  bottomDockContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EFE9',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 16,
    alignItems: 'center',
  },
  bottomDockWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  saveButton: {
    backgroundColor: '#0B5D3D',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B5D3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
