import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '../../components/auth/SafeScreen';
import Toast from '../../components/auth/Toast';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import { useAuth } from '../../contexts/auth-context';
import {
  useMedications,
  getFlattenedDoses,
  formatTime12h,
  getCurrentTime24,
  markDoseTaken,
} from '../../services/medicationService';
import ProgressRing from '../../components/patient/ProgressRing';
import BottomNav from '../../components/patient/BottomNav';
import PatientIcon from '../../components/patient/PatientIcons';

export default function DashboardScreen() {
  const medications = useMedications();
  const { user, signOut } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);

  const displayName = user?.fullName ? user.fullName.split(' ')[0] : 'Chathura';
  const fullName = user?.fullName || 'Chathura Rajapakse';
  const email = user?.email || '';
  const avatarInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CR';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSignOut = async () => {
    setAccountModalVisible(false);
    await signOut();
    showToast('Signed out of MediCare');
    setTimeout(() => {
      router.replace('/(auth)/login' as any);
    }, 400);
  };

  const handleSwitchAccount = async () => {
    setAccountModalVisible(false);
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  const handleViewProfile = () => {
    setAccountModalVisible(false);
    router.push('/(app)/(tabs)/profile' as any);
  };

  // Time-of-day greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Calculate schedule and progress
  const doses = getFlattenedDoses(medications);
  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.isTaken).length;
  const progressPercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

  const nowTime = getCurrentTime24();
  const dueCount = doses.filter((d) => !d.isTaken && d.time <= nowTime).length;
  const nextPendingDose = doses.find((d) => !d.isTaken);

  const handleTakeDose = async (id: number | string, time: string, medName: string) => {
    try {
      await markDoseTaken(id, time);
      showToast(`${medName} dose marked as taken`);
    } catch (e) {
      showToast('Could not record dose');
    }
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
          {/* Header Bar */}
          <View style={styles.topRow}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingTitle} allowFontScaling={true}>
                {greeting}, {displayName}
              </Text>
              <Text style={styles.subTitle} allowFontScaling={true}>
                {formattedDate}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setAccountModalVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Account options for ${fullName}`}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText} allowFontScaling={true}>
                  {avatarInitials}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressSectionLabel} allowFontScaling={true}>
                Today's Progress
              </Text>
              <Text style={styles.progressBigText} allowFontScaling={true}>
                {takenDoses} of {totalDoses} doses
              </Text>
              <Text style={styles.progressOkLabel} allowFontScaling={true}>
                taken
              </Text>
              <Text style={styles.progressSubtext} allowFontScaling={true}>
                {nextPendingDose
                  ? `Next: ${nextPendingDose.medication.name} at ${formatTime12h(
                      nextPendingDose.time
                    )}`
                  : 'All done for today. Well done!'}
              </Text>
            </View>
            <View style={styles.ringWrapper}>
              <ProgressRing percent={progressPercent} size={92} strokeWidth={10} />
            </View>
          </View>

          {/* Stat Tiles */}
          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Text style={styles.statLabel} allowFontScaling={true}>
                Medicines
              </Text>
              <Text style={styles.statNumber} allowFontScaling={true}>
                {medications.length}
              </Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel} allowFontScaling={true}>
                Taken
              </Text>
              <Text
                style={[styles.statNumber, { color: PATIENT_COLORS.accent }]}
                allowFontScaling={true}
              >
                {takenDoses}
              </Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statLabel} allowFontScaling={true}>
                Due now
              </Text>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color:
                      dueCount > 0 ? PATIENT_COLORS.danger : PATIENT_COLORS.text,
                  },
                ]}
                allowFontScaling={true}
              >
                {dueCount}
              </Text>
            </View>
          </View>

          {/* Today's Schedule */}
          <Text style={styles.scheduleHeader} allowFontScaling={true}>
            Today's Schedule
          </Text>

          {doses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText} allowFontScaling={true}>
                No medicines yet. Add your first one.
              </Text>
            </View>
          ) : (
            doses.map((item, idx) => {
              const { medication, time, isTaken, isDue, period } = item;
              return (
                <View
                  key={`${medication.id}-${time}-${idx}`}
                  style={[
                    styles.doseCard,
                    isTaken && styles.doseCardDone,
                    !isTaken && isDue && styles.doseCardDue,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.doseMainInfo}
                    onPress={() =>
                      router.push({
                        pathname: '/(patient)/medication-detail',
                        params: { id: medication.id },
                      } as any)
                    }
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View details for ${medication.name}`}
                  >
                    <Text style={styles.doseTimePeriod} allowFontScaling={true}>
                      {period} • {formatTime12h(time)}
                    </Text>
                    <Text style={styles.doseMedName} allowFontScaling={true}>
                      {medication.name}
                    </Text>
                  </TouchableOpacity>

                  {isTaken ? (
                    <View
                      style={styles.takenChip}
                      accessible={true}
                      accessibilityLabel={`${medication.name} at ${formatTime12h(time)} is taken`}
                    >
                      <PatientIcon
                        name="check"
                        size={16}
                        color={PATIENT_COLORS.brand}
                        strokeWidth={2.4}
                      />
                      <Text style={styles.takenChipText} allowFontScaling={true}>
                        Taken
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.takeButton}
                      onPress={() => handleTakeDose(medication.id, time, medication.name)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Mark ${medication.name} as taken`}
                    >
                      <Text style={styles.takeButtonText} allowFontScaling={true}>
                        Take
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
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

      {/* Account & Session Management Modal */}
      <Modal
        visible={accountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAccountModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>{avatarInitials}</Text>
              </View>
              <View style={styles.modalUserInfo}>
                <Text style={styles.modalUserName} numberOfLines={1} allowFontScaling={true}>
                  {fullName}
                </Text>
                <Text style={styles.modalUserEmail} numberOfLines={1} allowFontScaling={true}>
                  {email}
                </Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText} allowFontScaling={true}>
                    {user?.role === 'caregiver' ? 'Caregiver' : 'Patient'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalDivider} />

            {/* Quick Navigation Actions */}
            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={handleViewProfile}
              activeOpacity={0.8}
            >
              <PatientIcon name="user" size={18} color={PATIENT_COLORS.brand} strokeWidth={2.2} />
              <Text style={styles.modalActionText} allowFontScaling={true}>
                View Full Profile & Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionButton}
              onPress={handleSwitchAccount}
              activeOpacity={0.8}
            >
              <PatientIcon name="home" size={18} color={PATIENT_COLORS.brand} strokeWidth={2.2} />
              <Text style={styles.modalActionText} allowFontScaling={true}>
                Switch Account / Auth
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalActionButton, styles.signOutButton]}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutText} allowFontScaling={true}>
                Sign Out of MediCare
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAccountModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText} allowFontScaling={true}>
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating Bottom Nav */}
      <BottomNav currentTab="dashboard" onShowToast={showToast} />

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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
    letterSpacing: -0.3,
  },
  subTitle: {
    color: PATIENT_COLORS.muted,
    fontSize: 15,
    marginTop: 2,
    fontWeight: '500',
  },
  avatarButton: {
    padding: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PATIENT_COLORS.brand,
    borderWidth: 3,
    borderColor: PATIENT_COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: PATIENT_COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: PATIENT_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PATIENT_COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: {
    color: PATIENT_COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
  },
  modalUserEmail: {
    fontSize: 12,
    color: PATIENT_COLORS.muted,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: PATIENT_COLORS.mint,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: PATIENT_COLORS.brand,
  },
  modalDivider: {
    height: 1,
    backgroundColor: PATIENT_COLORS.border,
    marginVertical: 16,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: PATIENT_COLORS.background,
    marginBottom: 8,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: PATIENT_COLORS.deep,
  },
  signOutButton: {
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: PATIENT_COLORS.danger,
    textAlign: 'center',
  },
  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '600',
    color: PATIENT_COLORS.muted,
  },
  progressCard: {
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressSectionLabel: {
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
    fontSize: 16,
  },
  progressBigText: {
    fontSize: 28,
    fontWeight: '800',
    color: PATIENT_COLORS.text,
    marginTop: 2,
  },
  progressOkLabel: {
    color: PATIENT_COLORS.accent,
    fontWeight: '600',
    fontSize: 15,
  },
  progressSubtext: {
    color: PATIENT_COLORS.muted,
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  ringWrapper: {
    width: 92,
    height: 92,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  statTile: {
    flex: 1,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PATIENT_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: PATIENT_COLORS.text,
  },
  scheduleHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 2,
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
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  doseCardDue: {
    backgroundColor: PATIENT_COLORS.warnBg,
    borderColor: PATIENT_COLORS.warnBorder,
  },
  doseCardDone: {
    backgroundColor: PATIENT_COLORS.mint,
    borderColor: PATIENT_COLORS.mintBorder,
  },
  doseMainInfo: {
    flex: 1,
    minWidth: 0,
  },
  doseTimePeriod: {
    fontSize: 12,
    fontWeight: '700',
    color: PATIENT_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  doseMedName: {
    fontSize: 16,
    fontWeight: '700',
    color: PATIENT_COLORS.text,
    marginTop: 2,
  },
  takenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.mint,
    minHeight: 44,
  },
  takenChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: PATIENT_COLORS.brand,
  },
  takeButton: {
    minHeight: 44,
    minWidth: 78,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeButtonText: {
    color: PATIENT_COLORS.white,
    fontWeight: '700',
    fontSize: 15,
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
    marginTop: 10,
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
