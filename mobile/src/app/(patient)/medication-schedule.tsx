import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, type Href } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import PatientBottomNav from '@/components/patient/BottomNav';
import { useMedicareStore, type ScheduleItem } from '@/medicare';

export default function MedicationScheduleScreen() {
  const router = useRouter();
  const { schedule, isLoading, error, refresh } = useMedicareStore();
  const [retryError, setRetryError] = useState('');
  const [retrying, setRetrying] = useState(false);

  const busy = isLoading || retrying;
  const displayedError = error || retryError;

  const handleRefresh = async () => {
    if (retrying) return;

    setRetrying(true);
    setRetryError('');

    try {
      await refresh();
    } catch (err) {
      setRetryError(
        err instanceof Error
          ? err.message
          : 'Could not load your medication schedule.'
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleBack = () => {
    router.navigate('/(app)/(tabs)/menu' as Href);
  };

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const morningItems = schedule.filter(
    (item) => item.period === 'MORNING'
  );
  const afternoonItems = schedule.filter(
    (item) => item.period === 'AFTERNOON'
  );
  const eveningItems = schedule.filter(
    (item) => item.period === 'EVENING'
  );

  const totalCount = schedule.length;
  const takenCount = schedule.filter(
    (item) => item.status === 'TAKEN'
  ).length;

  const progressPercent =
    totalCount > 0
      ? Math.min(Math.round((takenCount / totalCount) * 100), 100)
      : 0;

  const handleAddMedication = () => {
    router.push({
      pathname: '/reminder-setup',
      params: { from: '/medication-schedule' },
    });
  };

  const handleCardPress = (item: ScheduleItem) => {
    if (item.status === 'MISSED') {
      router.push({
        pathname: '/missed-dose',
        params: { id: item.id, from: '/medication-schedule' },
      });
    } else if (item.status === 'DUE_SOON') {
      router.push({
        pathname: '/mark-as-taken',
        params: { id: item.id, from: '/medication-schedule' },
      });
    } else {
      router.push({
        pathname: '/reminder-setup',
        params: { id: item.id, from: '/medication-schedule' },
      });
    }
  };

  const handleLogPress = (item: ScheduleItem) => {
    router.push({
      pathname: '/mark-as-taken',
      params: { id: item.id, from: '/medication-schedule' },
    });
  };

  const renderCard = (item: ScheduleItem) => {
    const isMissed = item.status === 'MISSED';
    const isDueSoon = item.status === 'DUE_SOON';
    const isTaken = item.status === 'TAKEN';
    const isSkipped = item.status === 'SKIPPED';
    const isUpcoming = item.status === 'UPCOMING';

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          isMissed && styles.cardMissed,
          isTaken && styles.cardTaken,
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.iconContainer,
            isMissed
              ? styles.iconContainerMissed
              : isTaken
                ? styles.iconContainerTaken
                : styles.iconContainerNormal,
          ]}
        >
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

        <View style={styles.cardInfo}>
          <Text style={[styles.medName, isMissed && styles.medNameMissed]}>
            {item.name}
          </Text>
          <Text style={styles.medDetails}>
            {item.dosage} {'\u2022'} {item.instructions}
          </Text>

          <View style={styles.statusRow}>
            {isTaken && (
              <View style={styles.takenBadge}>
                <Ionicons name="checkmark" size={13} color="#10B981" />
                <Text style={styles.takenText}>TAKEN</Text>
              </View>
            )}

            {isDueSoon && (
              <View style={styles.dueSoonBadge}>
                <Ionicons name="time-outline" size={13} color="#059669" />
                <Text style={styles.dueSoonText}>DUE SOON</Text>
              </View>
            )}

            {isUpcoming && (
              <View style={styles.upcomingBadge}>
                <Ionicons name="calendar-outline" size={13} color="#2563EB" />
                <Text style={styles.upcomingText}>UPCOMING</Text>
              </View>
            )}

            {isMissed && (
              <View style={styles.missedRow}>
                <Ionicons
                  name="alert-circle"
                  size={15}
                  color={Colors.light.alert}
                />
                <Text style={styles.missedText}>MISSED</Text>
              </View>
            )}

            {isSkipped && (
              <View style={styles.skippedBadge}>
                <Ionicons name="close" size={13} color="#64748B" />
                <Text style={styles.skippedText}>SKIPPED</Text>
              </View>
            )}

            <Text style={styles.nextText}>{item.nextTime}</Text>
          </View>
        </View>

        {(isTaken || isSkipped || isDueSoon) && (
          <TouchableOpacity
            style={styles.logButton}
            onPress={(event) => {
              event.stopPropagation();
              handleLogPress(item);
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isDueSoon
                ? `Log dose for ${item.name}`
                : `Edit dose log for ${item.name}`
            }
            activeOpacity={0.75}
          >
            <Text style={styles.logButtonText}>
              {isDueSoon ? 'Log' : 'Edit log'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          <View style={styles.darkBanner}>
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerLeft}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                  accessibilityLabel="Back to Main Menu"
                  accessibilityRole="button"
                >
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <View>
                  <Text style={styles.todayHeading}>Today</Text>
                  <Text style={styles.dateSubtext}>{todayLabel}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addFab}
                onPress={handleAddMedication}
                activeOpacity={0.75}
                accessibilityLabel="Add Reminder"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Daily Progress</Text>
                <Text style={styles.progressFraction}>
                  {takenCount}/{totalCount} Taken
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

          <View style={styles.scheduleBody}>
            {busy && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={styles.loadingText}>Loading your schedule...</Text>
              </View>
            )}

            {!!displayedError && !busy && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={28}
                  color="#B91C1C"
                />
                <Text style={styles.errorTitle}>
                  Could not load your schedule
                </Text>
                <Text style={styles.errorText}>{displayedError}</Text>

                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={handleRefresh}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading schedule"
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyAddButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {totalCount === 0 ? (
              !busy && !displayedError && (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons
                      name="pill-off"
                      size={38}
                      color="#10B981"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    No Medications Scheduled
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    You don't have any medication reminders scheduled for
                    today. Tap the "+" button above to add one.
                  </Text>

                  <TouchableOpacity
                    style={styles.emptyAddButton}
                    onPress={handleAddMedication}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyAddButtonText}>
                      Add Medication
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reloadButton}
                    onPress={handleRefresh}
                    accessibilityRole="button"
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reloadText}>Reload schedule</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <>
                {morningItems.length > 0 && (
                  <View style={styles.groupSection}>
                    <View style={styles.groupHeaderRow}>
                      <Ionicons
                        name="sunny-outline"
                        size={17}
                        color="#4A6054"
                      />
                      <Text style={styles.groupHeaderText}>MORNING</Text>
                    </View>
                    {morningItems.map(renderCard)}
                  </View>
                )}

                {afternoonItems.length > 0 && (
                  <View style={styles.groupSection}>
                    <View style={styles.groupHeaderRow}>
                      <Ionicons
                        name="partly-sunny-outline"
                        size={17}
                        color="#4A6054"
                      />
                      <Text style={styles.groupHeaderText}>AFTERNOON</Text>
                    </View>
                    {afternoonItems.map(renderCard)}
                  </View>
                )}

                {eveningItems.length > 0 && (
                  <View style={styles.groupSection}>
                    <View style={styles.groupHeaderRow}>
                      <Ionicons
                        name="moon-outline"
                        size={17}
                        color="#4A6054"
                      />
                      <Text style={styles.groupHeaderText}>EVENING</Text>
                    </View>
                    {eveningItems.map(renderCard)}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <PatientBottomNav currentTab="reminders" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E3228',
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#F3FAF7',
    minHeight: '100%',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  darkBanner: {
    backgroundColor: '#1E3228',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    paddingTop: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    color: '#4A6054',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },
  reloadButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  reloadText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#2BB673',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  groupSection: {
    marginBottom: 24,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
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
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFE9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTaken: {
    backgroundColor: '#F0F9F5',
    borderColor: '#D4EADF',
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
    marginRight: 14,
  },
  iconContainerNormal: {
    backgroundColor: '#E6F4EE',
  },
  iconContainerTaken: {
    backgroundColor: '#E2F4EB',
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
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginRight: 8,
  },
  upcomingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
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
  skippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    marginRight: 8,
  },
  skippedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
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
});