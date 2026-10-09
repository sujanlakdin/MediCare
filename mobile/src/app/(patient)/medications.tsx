import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '../../components/auth/SafeScreen';
import Toast from '../../components/auth/Toast';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import { useAuth } from '../../contexts/auth-context';
import {
  useMedications,
  listMedications,
  deleteMedication,
  formatTime12h,
  getTimePeriod,
  getFlattenedDoses,
} from '../../services/medicationService';
import BottomNav from '../../components/patient/BottomNav';
import PatientIcon from '../../components/patient/PatientIcons';
import MedicationThumb from '../../components/patient/MedicationThumb';

type PeriodFilter = 'All' | 'Morning' | 'Afternoon' | 'Evening';

export default function MedicationsScreen() {
  const { user } = useAuth();
  const medications = useMedications(user?.id);

  useEffect(() => {
    if (user?.id) {
      listMedications(user.id);
    }
  }, [user?.id]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PeriodFilter>('All');
  const [armedDeleteId, setArmedDeleteId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const armTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Routine progress calculation
  const doses = getFlattenedDoses(medications);
  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.isTaken).length;
  const percentDone = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  const nextPending = doses.find((d) => !d.isTaken);

  // Filter & Search logic
  const queryClean = searchQuery.trim().toLowerCase();
  const filteredMeds = medications.filter((m) => {
    const matchesQuery =
      !queryClean ||
      (m.name + ' ' + (m.purpose || '')).toLowerCase().includes(queryClean);

    const matchesPeriod =
      activeFilter === 'All' ||
      m.times.some((t) => getTimePeriod(t) === activeFilter);

    return matchesQuery && matchesPeriod;
  });

  // Check low stock when alert is on and stock <= 5
  const lowStockMed = medications.find((m) => m.alert && m.stock <= 5);

  // 2-Tap Delete Handler
  const handleDeletePress = async (id: number | string, name: string) => {
    if (armedDeleteId === id) {
      if (armTimeoutRef.current) clearTimeout(armTimeoutRef.current);
      setArmedDeleteId(null);
      await deleteMedication(id);
      showToast(`${name} deleted`);
    } else {
      setArmedDeleteId(id);
      if (armTimeoutRef.current) clearTimeout(armTimeoutRef.current);
      armTimeoutRef.current = setTimeout(() => {
        setArmedDeleteId(null);
      }, 3000);
    }
  };

  const handleCardPress = (id: number | string) => {
    router.push({
      pathname: '/(patient)/medication-detail' as any,
      params: { id: String(id) },
    });
  };

  const handleEditPress = (id: number | string) => {
    router.push({
      pathname: '/(patient)/medication-form' as any,
      params: { id: String(id) },
    });
  };

  return (
    <View style={styles.outerContainer}>
      <SafeScreen
        style={styles.safeArea}
        backgroundColor={PATIENT_COLORS.background}
        barStyle="dark-content"
        contentContainerStyle={styles.safeContent}
      >
        <View style={styles.mainContent}>
          {/* Header */}
          <Text style={styles.title} allowFontScaling={true}>
            Medication List
          </Text>
          <Text style={styles.subTitle} allowFontScaling={true}>
            Your medicines and reminder times
          </Text>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <PatientIcon name="search" size={20} color={PATIENT_COLORS.ph} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicine name or purpose"
              placeholderTextColor={PATIENT_COLORS.ph}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search medicine name"
              allowFontScaling={true}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                style={styles.clearSearchBtn}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Today's Routine Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerTag} allowFontScaling={true}>
              TODAY'S ROUTINE
            </Text>
            <Text style={styles.bannerBig} allowFontScaling={true}>
              {takenDoses} of {totalDoses} doses taken
            </Text>
            <Text style={styles.bannerSub} allowFontScaling={true}>
              {nextPending
                ? `Next up: ${nextPending.medication.name} at ${formatTime12h(
                    nextPending.time
                  )}`
                : 'Everything taken'}
              {' • '}
              {percentDone}% done
            </Text>
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {(['All', 'Morning', 'Afternoon', 'Evening'] as PeriodFilter[]).map((period) => {
              const isSelected = activeFilter === period;
              const label =
                period === 'All' ? `All (${medications.length})` : period;
              return (
                <TouchableOpacity
                  key={period}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setActiveFilter(period)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Filter by ${period}`}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Medicines List */}
          {filteredMeds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText} allowFontScaling={true}>
                No medicines found.
              </Text>
            </View>
          ) : (
            filteredMeds.map((med) => {
              const isArmed = armedDeleteId === med.id;
              const formattedTimes = med.times.map(formatTime12h).join(' & ');

              return (
                <View key={med.id} style={styles.medCard}>
                  <TouchableOpacity
                    onPress={() => handleCardPress(med.id)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${med.name}`}
                    style={styles.cardTopRow}
                  >
                    {/* Left: Medication thumbnail */}
                    <MedicationThumb uri={med.image} size={56} radius={16} style={styles.cardThumb} />

                    {/* Right: Info */}
                    <View style={styles.cardBody}>
                      {/* Row 1: Name and Active badge */}
                      <View style={styles.cardHeader}>
                        <Text style={styles.medName} allowFontScaling={true} numberOfLines={1}>
                          {med.name}
                        </Text>
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText} allowFontScaling={true}>
                            Active
                          </Text>
                        </View>
                      </View>

                      {/* Purpose */}
                      <Text style={styles.medPurpose} allowFontScaling={true} numberOfLines={1}>
                        For {med.purpose || 'general health'}
                      </Text>

                      {/* Times & Form info */}
                      <View style={styles.medScheduleRow}>
                        <PatientIcon name="clock" size={16} color={PATIENT_COLORS.muted} />
                        <Text style={styles.medScheduleText} allowFontScaling={true} numberOfLines={1}>
                          {formattedTimes} • {med.qty} {med.form.toLowerCase()}
                          {med.qty > 1 ? 's' : ''} • {med.meal}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Card Footer: Repeat and Actions */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.repeatText} allowFontScaling={true}>
                      Repeat:{' '}
                      <Text style={styles.repeatValueText} allowFontScaling={true}>
                        {med.repeat}
                      </Text>
                    </Text>

                    <View style={styles.actionButtonsRow}>
                      {/* Edit Button */}
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditPress(med.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${med.name}`}
                      >
                        <PatientIcon
                          name="edit"
                          size={20}
                          color={PATIENT_COLORS.muted}
                        />
                      </TouchableOpacity>

                      {/* Delete Button with 2-tap confirmation */}
                      <TouchableOpacity
                        style={[
                          styles.iconButton,
                          isArmed && styles.iconButtonArmed,
                        ]}
                        onPress={() => handleDeletePress(med.id, med.name)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={
                          isArmed
                            ? `Confirm delete ${med.name}`
                            : `Delete ${med.name}`
                        }
                      >
                        <PatientIcon
                          name="trash"
                          size={19}
                          color={
                            isArmed ? PATIENT_COLORS.danger : PATIENT_COLORS.muted
                          }
                        />
                        {isArmed && (
                          <Text
                            style={styles.sureConfirmText}
                            allowFontScaling={true}
                          >
                            Sure?
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {/* Refill Reminder Alert */}
          {lowStockMed && (
            <View style={styles.refillCard}>
              <Text style={styles.refillTitle} allowFontScaling={true}>
                Refill reminder
              </Text>
              <Text style={styles.refillSub} allowFontScaling={true}>
                {lowStockMed.name} has {lowStockMed.stock} pills left.
              </Text>
            </View>
          )}

          {/* Add Medication Pill Button */}
          <TouchableOpacity
            style={styles.addMedButton}
            onPress={() => router.push('/(patient)/medication-form' as any)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add Medication"
          >
            <PatientIcon name="plus" size={22} color={PATIENT_COLORS.white} strokeWidth={2.4} />
            <Text style={styles.addMedButtonText} allowFontScaling={true}>
              Add Medication
            </Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>

      {/* Floating Bottom Nav */}
      <BottomNav currentTab="medications" onShowToast={showToast} />

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: PATIENT_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  safeContent: {
    paddingBottom: 24,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
    letterSpacing: -0.3,
  },
  subTitle: {
    color: PATIENT_COLORS.muted,
    fontSize: 15,
    marginTop: 2,
    marginBottom: 4,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1.5,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginVertical: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: PATIENT_COLORS.text,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 6,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    fontSize: 16,
    color: PATIENT_COLORS.muted,
  },
  banner: {
    backgroundColor: PATIENT_COLORS.brand,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  bannerTag: {
    fontSize: 12,
    fontWeight: '700',
    color: PATIENT_COLORS.white,
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  bannerBig: {
    fontSize: 22,
    fontWeight: '800',
    color: PATIENT_COLORS.white,
    marginVertical: 4,
  },
  bannerSub: {
    fontSize: 14,
    color: PATIENT_COLORS.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1.5,
    borderColor: PATIENT_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: PATIENT_COLORS.brand,
    borderColor: PATIENT_COLORS.brand,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: PATIENT_COLORS.text,
  },
  filterChipTextActive: {
    color: PATIENT_COLORS.white,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: PATIENT_COLORS.muted,
    fontSize: 16,
    fontWeight: '500',
  },
  medCard: {
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardThumb: {
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: PATIENT_COLORS.text,
    flex: 1,
  },
  activeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.mint,
  },
  activeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: PATIENT_COLORS.brand,
  },
  medPurpose: {
    color: PATIENT_COLORS.muted,
    fontSize: 14,
    marginTop: 3,
    marginBottom: 6,
    fontWeight: '500',
  },
  medScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medScheduleText: {
    fontSize: 14,
    color: PATIENT_COLORS.text,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: PATIENT_COLORS.border,
  },
  repeatText: {
    fontSize: 14,
    color: PATIENT_COLORS.muted,
  },
  repeatValueText: {
    color: PATIENT_COLORS.text,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  iconButton: {
    minWidth: 48,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  iconButtonArmed: {
    backgroundColor: PATIENT_COLORS.dangerBg,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
  },
  sureConfirmText: {
    color: PATIENT_COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  refillCard: {
    backgroundColor: PATIENT_COLORS.mint,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.mintBorder,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  refillTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
    marginBottom: 2,
  },
  refillSub: {
    fontSize: 14,
    color: PATIENT_COLORS.muted,
    fontWeight: '500',
  },
  addMedButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: PATIENT_COLORS.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  addMedButtonText: {
    color: PATIENT_COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
