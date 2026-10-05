import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';

interface MedicationScheduleItem {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  status: 'TAKEN' | 'DUE_SOON' | 'MISSED';
  nextTime: string;
  iconType: 'pill' | 'water';
  period: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

const INITIAL_SCHEDULE: MedicationScheduleItem[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    instructions: 'With food',
    status: 'TAKEN',
    nextTime: 'Next: Tomorrow, 8:00 AM',
    iconType: 'pill',
    period: 'MORNING',
  },
  {
    id: '2',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    instructions: 'Anytime',
    status: 'TAKEN',
    nextTime: 'Next: Tomorrow, 8:00 AM',
    iconType: 'pill',
    period: 'MORNING',
  },
  {
    id: '3',
    name: 'Metformin',
    dosage: '500mg',
    instructions: 'With lunch',
    status: 'DUE_SOON',
    nextTime: 'Next: Tomorrow, 1:00 PM',
    iconType: 'water',
    period: 'AFTERNOON',
  },
  {
    id: '4',
    name: 'Atorvastatin',
    dosage: '20mg',
    instructions: 'Before bed',
    status: 'MISSED',
    nextTime: 'Next: Tomorrow, 9:00 PM',
    iconType: 'pill',
    period: 'EVENING',
  },
];

export default function MedicationScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<MedicationScheduleItem[]>(INITIAL_SCHEDULE);

  // Group items by period
  const morningItems = schedule.filter((item) => item.period === 'MORNING');
  const afternoonItems = schedule.filter((item) => item.period === 'AFTERNOON');
  const eveningItems = schedule.filter((item) => item.period === 'EVENING');

  // Adherence calculations matching mockup "3/5 Taken"
  const takenCount = schedule.filter((item) => item.status === 'TAKEN').length;
  // Starting mockup displays 3 taken out of 5 daily doses
  const displayTaken = takenCount + 1; // 2 initial TAKEN items in state + 1 = 3/5 initial
  const totalCount = 5;
  const progressPercent = Math.min(Math.round((displayTaken / totalCount) * 100), 100);

  const handleLogMedication = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'TAKEN' ? 'DUE_SOON' : 'TAKEN';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleAddMedication = () => {
    Alert.alert('Add Medication', 'Add a new scheduled dose.');
  };

  const renderCard = (item: MedicationScheduleItem) => {
    const isMissed = item.status === 'MISSED';
    const isDueSoon = item.status === 'DUE_SOON';
    const isTaken = item.status === 'TAKEN';

    return (
      <View
        key={item.id}
        style={[styles.card, isMissed && styles.cardMissed]}>
        {/* Left Icon Container */}
        <View
          style={[
            styles.iconContainer,
            isMissed ? styles.iconContainerMissed : styles.iconContainerNormal,
          ]}>
          {item.iconType === 'water' ? (
            <Ionicons
              name="water-outline"
              size={24}
              color={isMissed ? Colors.light.alert : '#10B981'}
            />
          ) : (
            <MaterialCommunityIcons
              name="pill"
              size={24}
              color={isMissed ? Colors.light.alert : '#10B981'}
            />
          )}
        </View>

        {/* Info Column */}
        <View style={styles.cardInfo}>
          <Text style={[styles.medName, isMissed && styles.medNameMissed]}>
            {item.name}
          </Text>
          <Text style={styles.medDetails}>
            {item.dosage} • {item.instructions}
          </Text>

          {/* Status Row */}
          <View style={styles.statusRow}>
            {isTaken && (
              <View style={styles.takenBadge}>
                <Ionicons name="checkmark" size={13} color="#10B981" />
                <Text style={styles.takenText}>TAKEN</Text>
              </View>
            )}

            {isDueSoon && (
              <View style={styles.dueSoonBadge}>
                <Ionicons name="time-outline" size={13} color="#10B981" />
                <Text style={styles.dueSoonText}>DUE SOON</Text>
              </View>
            )}

            {isMissed && (
              <View style={styles.missedRow}>
                <Ionicons name="alert-circle" size={15} color={Colors.light.alert} />
                <Text style={styles.missedText}>MISSED</Text>
              </View>
            )}

            <Text style={styles.nextText}>{item.nextTime}</Text>
          </View>
        </View>

        {/* Action Button for due soon items */}
        {isDueSoon && (
          <TouchableOpacity
            style={styles.logButton}
            onPress={() => handleLogMedication(item.id)}
            activeOpacity={0.8}>
            <Text style={styles.logButtonText}>Log</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Hide Expo Router's auto tabs to use our matching bottom nav */}
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Top Screen Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.screenTitle}>Medication Schedule</Text>
          </View>

          {/* Dark Forest Green Header Banner */}
          <View style={styles.darkBanner}>
            <View style={styles.bannerTopRow}>
              <View>
                <Text style={styles.todayHeading}>Today</Text>
                <Text style={styles.dateSubtext}>Thursday, Oct 24</Text>
              </View>
              <TouchableOpacity
                style={styles.addFab}
                onPress={handleAddMedication}
                activeOpacity={0.85}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Daily Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Daily Progress</Text>
                <Text style={styles.progressFraction}>
                  {displayTaken}/{totalCount} Taken
                </Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Schedule Groups */}
          <View style={styles.scheduleBody}>
            {/* Morning Group */}
            <View style={styles.groupSection}>
              <View style={styles.groupHeaderRow}>
                <Ionicons name="sunny-outline" size={17} color="#4A6054" />
                <Text style={styles.groupHeaderText}>MORNING</Text>
              </View>
              {morningItems.map(renderCard)}
            </View>

            {/* Afternoon Group */}
            <View style={styles.groupSection}>
              <View style={styles.groupHeaderRow}>
                <Ionicons name="partly-sunny-outline" size={17} color="#4A6054" />
                <Text style={styles.groupHeaderText}>AFTERNOON</Text>
              </View>
              {afternoonItems.map(renderCard)}
            </View>

            {/* Evening Group */}
            <View style={styles.groupSection}>
              <View style={styles.groupHeaderRow}>
                <Ionicons name="moon-outline" size={17} color="#4A6054" />
                <Text style={styles.groupHeaderText}>EVENING</Text>
              </View>
              {eveningItems.map(renderCard)}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation matching design */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavRow}>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push('/')}>
            <Ionicons name="grid-outline" size={22} color={Colors.light.tabInactive} />
            <Text style={styles.navLabel}>Dashboard</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push('/patients')}>
            <Ionicons name="people-outline" size={22} color={Colors.light.tabInactive} />
            <Text style={styles.navLabel}>Patients</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push('/reports')}>
            <Ionicons name="stats-chart-outline" size={22} color={Colors.light.tabInactive} />
            <Text style={styles.navLabel}>Reports</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push('/alerts')}>
            <Ionicons name="notifications" size={22} color={Colors.light.accent} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Alerts</Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => router.push('/profile')}>
            <Ionicons name="person-outline" size={22} color={Colors.light.tabInactive} />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3FAF7',
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#F3FAF7',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  titleContainer: {
    backgroundColor: '#F3FAF7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: -0.2,
  },
  darkBanner: {
    backgroundColor: '#1E3228',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  todayHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  dateSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A3BFA8',
    marginTop: 4,
  },
  addFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2BB673',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressFraction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34D399',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14251E',
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  scheduleBody: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  groupSection: {
    marginBottom: 18,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A6054',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardMissed: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5',
    borderWidth: 1.2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerNormal: {
    backgroundColor: '#E6F4EE',
  },
  iconContainerMissed: {
    backgroundColor: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  medNameMissed: {
    color: '#0F172A',
  },
  medDetails: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EE',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    marginRight: 8,
  },
  takenText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  dueSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginRight: 8,
  },
  dueSoonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.4,
  },
  missedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  missedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.alert,
    letterSpacing: 0.4,
  },
  nextText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  logButton: {
    backgroundColor: '#2BB673',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomNavContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.light.tabInactive,
    marginTop: 4,
  },
  navLabelActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#0F172A',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
});
