import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';

export default function MissedDoseScreen() {
  const router = useRouter();

  // Mock data as requested
  const medication = {
    name: 'Metformin',
    dosage: '500mg Tablet',
    scheduledTime: '08:00 AM',
    status: '3h 15m late',
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Missed Dose Guidance',
      'If you missed a scheduled dose, check your prescribed instructions or reach out to your doctor or pharmacist for tailored medical advice.'
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/medication-schedule' as any);
    }
  };

  const handleLogTaken = () => {
    router.push('/mark-as-taken' as any);
  };

  const handleSkipDose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/medication-schedule' as any);
    }
  };

  const handleReschedule = () => {
    router.push('/reminder-setup' as any);
  };

  const handleContactCareTeam = () => {
    Alert.alert(
      'Contact Care Team',
      'Would you like to connect with Dr. Sarah Jenkins (Primary Care)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Care Team',
          onPress: () => {
            Linking.openURL('tel:+15550192831').catch(() => {
              Alert.alert('Phone Service Unavailable', 'Unable to initiate call on this device.');
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Hide Expo Router auto tabs and default header title */}
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false, title: '' }} />
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      {/* Screen Header matching design */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Missed Dose</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleHelpPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Missed dose guidance"
          accessibilityRole="button">
          <Ionicons name="help-circle-outline" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Red Missed-Dose Card */}
          <View style={styles.missedCard}>
            <View style={styles.missedCardHeader}>
              <View style={styles.alertIconCircle}>
                <MaterialCommunityIcons name="alert" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.missedCardTitleContainer}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationDosage}>{medication.dosage}</Text>
              </View>
            </View>

            <View style={styles.missedCardDetails}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>SCHEDULED</Text>
                <Text style={styles.detailValue}>{medication.scheduledTime}</Text>
              </View>
              <View style={[styles.detailCol, styles.alignRight]}>
                <Text style={[styles.detailLabel, styles.alignRight]}>STATUS</Text>
                <Text style={[styles.detailValueStatus, styles.alignRight]}>
                  {medication.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Grey / Sage Warning Box */}
          <View style={styles.warningBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#334155"
              style={styles.warningIcon}
            />
            <Text style={styles.warningText}>
              Do not double your dose to make up for a missed one unless specifically instructed
              by your doctor. Please review your instructions below.
            </Text>
          </View>

          {/* Instructions for Missed Dose Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Instructions for Missed Dose</Text>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionText}>
                If you miss a dose, take it as soon as you remember. However, if it is almost time
                for your next dose, skip the missed dose and go back to your regular schedule.
              </Text>
            </View>
          </View>

          {/* Actions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Actions</Text>

            {/* Action 1: Log as taken now */}
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={handleLogTaken}
              activeOpacity={0.85}
              accessibilityLabel="Log as taken now"
              accessibilityRole="button">
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Log as taken now</Text>
            </TouchableOpacity>

            {/* Action 2: Skip this dose */}
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={handleSkipDose}
              activeOpacity={0.7}
              accessibilityLabel="Skip this dose"
              accessibilityRole="button">
              <Ionicons name="close" size={20} color="#334155" />
              <Text style={styles.secondaryActionText}>Skip this dose</Text>
            </TouchableOpacity>

            {/* Action 3: Reschedule reminder */}
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={handleReschedule}
              activeOpacity={0.7}
              accessibilityLabel="Reschedule reminder"
              accessibilityRole="button">
              <Ionicons name="time-outline" size={20} color="#334155" />
              <Text style={styles.secondaryActionText}>Reschedule reminder</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Care Team Link */}
          <TouchableOpacity
            style={styles.careTeamLinkContainer}
            onPress={handleContactCareTeam}
            activeOpacity={0.7}
            accessibilityLabel="Contact your care team"
            accessibilityRole="link">
            <Text style={styles.careTeamLinkText}>Contact your care team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3FAF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  missedCard: {
    backgroundColor: '#FFF2F2',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 16,
  },
  missedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  alertIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C53030',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  missedCardTitleContainer: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: -0.2,
  },
  medicationDosage: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 2,
  },
  missedCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  detailCol: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailValueStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  warningBox: {
    backgroundColor: '#E7EDE8',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '400',
  },
  sectionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionText: {
    fontSize: 13.5,
    lineHeight: 21,
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },
  primaryActionButton: {
    backgroundColor: '#065F46',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  secondaryActionText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  careTeamLinkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 24,
  },
  careTeamLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    textDecorationLine: 'underline',
  },
});
