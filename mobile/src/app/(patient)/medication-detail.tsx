import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Image,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '../../components/auth/SafeScreen';
import Toast from '../../components/auth/Toast';
import BottomNav from '../../components/patient/BottomNav';
import PatientIcon from '../../components/patient/PatientIcons';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import {
  useMedications,
  formatTime12h,
  getTimePeriod,
  formatDaysSummary,
  markDoseTaken,
  deleteMedication,
  toggleRefillAlert,
  Medication,
} from '../../services/medicationService';

export default function MedicationDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const idNum = params.id ? Number(params.id) : null;
  const medications = useMedications();

  const medication: Medication | undefined = medications.find((m) => m.id === idNum);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isArmedDelete, setIsArmedDelete] = useState(false);
  const deleteTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  if (!medication) {
    return (
      <View style={styles.outerContainer}>
        <SafeScreen
          style={styles.safeArea}
          backgroundColor={PATIENT_COLORS.background}
          barStyle="dark-content"
          contentContainerStyle={styles.safeContent}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to medications list"
            >
              <PatientIcon name="back" size={20} color={PATIENT_COLORS.deep} strokeWidth={2.4} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} allowFontScaling={true}>
              Medication Detail
            </Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.notFoundCard}>
            <Text style={styles.notFoundText} allowFontScaling={true}>
              Medication not found. It may have been deleted.
            </Text>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.replace('/(patient)/medications' as any)}
              accessibilityRole="button"
              accessibilityLabel="Go to medications list"
            >
              <Text style={styles.primaryActionText} allowFontScaling={true}>
                Back to Medication List
              </Text>
            </TouchableOpacity>
          </View>
        </SafeScreen>
        <BottomNav currentTab="medications" onShowToast={showToast} />
        <Toast
          visible={toastVisible}
          message={toastMessage}
          onDismiss={() => setToastVisible(false)}
        />
      </View>
    );
  }

  // Parse strength badge from name (e.g. "500mg", "10 mg")
  const strengthMatch = (medication.name.match(/\d+\s?(mg|mcg|ml|g)\b/i) || [''])[0];
  const unitLabel = medication.form === 'Syrup' ? 'Dose' : medication.form;
  const dailyIntake = Math.max(medication.times.length * medication.qty, 1);
  const daysLeft = Math.floor(medication.stock / dailyIntake);

  const handleTakeDose = async (time: string) => {
    try {
      await markDoseTaken(medication.id, time);
      showToast(`${medication.name} (${formatTime12h(time)}) marked as taken`);
    } catch (e) {
      showToast('Could not record dose');
    }
  };

  const handleToggleAlert = async () => {
    try {
      const nextAlert = await toggleRefillAlert(medication.id);
      showToast(nextAlert ? 'Refill alert enabled' : 'Refill alert disabled');
    } catch (e) {
      showToast('Could not update refill alert');
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(patient)/medication-form',
      params: { id: medication.id },
    } as any);
  };

  const handleDelete = async () => {
    if (!isArmedDelete) {
      setIsArmedDelete(true);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => {
        setIsArmedDelete(false);
      }, 3000);
      return;
    }

    try {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      await deleteMedication(medication.id);
      showToast('Medication deleted');
      setTimeout(() => {
        router.replace('/(patient)/medications' as any);
      }, 300);
    } catch (e) {
      showToast('Could not delete medication');
      setIsArmedDelete(false);
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <PatientIcon name="back" size={20} color={PATIENT_COLORS.deep} strokeWidth={2.4} />
            </TouchableOpacity>

            <Text style={styles.headerTitle} allowFontScaling={true}>
              Medication Detail
            </Text>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={handleEdit}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${medication.name}`}
            >
              <PatientIcon name="edit" size={20} color={PATIENT_COLORS.deep} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Hero Card with Pill Illustration & Strength Badge */}
          <View style={styles.heroCard}>
            {medication.image ? (
              <View style={styles.heroImageContainer}>
                <Image
                  source={{ uri: medication.image }}
                  style={styles.heroImage}
                  resizeMode="cover"
                  accessibilityRole="image"
                  accessibilityLabel={`Photograph of ${medication.name}`}
                />
              </View>
            ) : (
              <View style={styles.pillArtContainer} accessible={true} accessibilityLabel="Pill graphic">
                <View style={styles.pillArtGroove} />
                {strengthMatch ? (
                  <View style={styles.strengthBadge}>
                    <Text style={styles.strengthBadgeText} allowFontScaling={true}>
                      {strengthMatch}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
            <Text style={styles.heroName} allowFontScaling={true}>
              {medication.name}
            </Text>
            <Text style={styles.heroSub} allowFontScaling={true}>
              {medication.form} • {medication.meal}
            </Text>
          </View>

          {/* Info Rows */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <PatientIcon name="pill" size={22} color={PATIENT_COLORS.brand} strokeWidth={2.2} />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel} allowFontScaling={true}>
                Medicine name
              </Text>
              <Text style={styles.infoValue} allowFontScaling={true}>
                {medication.name}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <PatientIcon name="check" size={22} color={PATIENT_COLORS.brand} strokeWidth={2.4} />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel} allowFontScaling={true}>
                Condition / treatment purpose
              </Text>
              <Text style={styles.infoValue} allowFontScaling={true}>
                For {medication.purpose || 'general health'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <PatientIcon name="plus" size={22} color={PATIENT_COLORS.brand} strokeWidth={2.4} />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel} allowFontScaling={true}>
                Dosage quantity
              </Text>
              <Text style={styles.infoValue} allowFontScaling={true}>
                {medication.qty} {unitLabel}{medication.qty > 1 ? 's' : ''} per intake
              </Text>
            </View>
          </View>

          {/* Frequency & Repeat Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading} allowFontScaling={true}>
              Frequency & Repeat
            </Text>
            <View style={styles.frequencyChip}>
              <Text style={styles.frequencyChipText} allowFontScaling={true}>
                {medication.times.length} Dose{medication.times.length > 1 ? 's' : ''} / Day
              </Text>
            </View>
          </View>
          <Text style={styles.sectionSub} allowFontScaling={true}>
            {medication.repeat} • {formatDaysSummary(medication.days)}
          </Text>

          {/* Reminder Times Schedule List */}
          {medication.times.map((time, idx) => {
            const isTaken = !!medication.taken[time];
            const period = getTimePeriod(time);
            const isEvening = period === 'Evening';

            return (
              <View
                key={`${time}-${idx}`}
                style={[styles.doseCard, isTaken && styles.doseCardDone]}
              >
                <View
                  style={[
                    styles.periodIconCircle,
                    {
                      backgroundColor: isEvening ? '#E8E8FA' : '#FFF4DA',
                    },
                  ]}
                >
                  <PatientIcon
                    name={isEvening ? 'moon' : 'sun'}
                    size={22}
                    color={isEvening ? '#5B5BD6' : '#E08A00'}
                    strokeWidth={2}
                  />
                </View>

                <View style={styles.doseInfoContainer}>
                  <Text style={styles.doseTimeText} allowFontScaling={true}>
                    {formatTime12h(time)}
                  </Text>
                  <Text style={styles.doseMetaText} allowFontScaling={true}>
                    {period} • {medication.meal} • {medication.qty} {medication.form}
                  </Text>
                </View>

                {isTaken ? (
                  <View
                    style={styles.takenChip}
                    accessible={true}
                    accessibilityLabel={`${formatTime12h(time)} dose taken`}
                  >
                    <Text style={styles.takenChipText} allowFontScaling={true}>
                      Taken
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.takeActionButton}
                    onPress={() => handleTakeDose(time)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Mark ${formatTime12h(time)} dose as taken`}
                  >
                    <Text style={styles.takeActionText} allowFontScaling={true}>
                      Take
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* Treatment Duration Row (When dates exist) */}
          {medication.start || medication.end ? (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <PatientIcon name="cal" size={22} color={PATIENT_COLORS.brand} strokeWidth={2} />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabel} allowFontScaling={true}>
                  Treatment duration
                </Text>
                <Text style={styles.infoValue} allowFontScaling={true}>
                  {medication.start || '—'} → {medication.end || 'ongoing'}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Refill Low-Supply Alert Card */}
          <View style={styles.refillCard}>
            <View style={styles.refillTextCol}>
              <Text style={styles.refillTitle} allowFontScaling={true}>
                Refill low-supply alert
              </Text>
              <Text style={styles.refillDesc} allowFontScaling={true}>
                Remind me when 5 pills remaining
              </Text>
              <Text style={styles.refillStock} allowFontScaling={true}>
                Current supply: {medication.stock} {medication.form.toLowerCase()}s left (~{daysLeft} days)
              </Text>
            </View>
            <Switch
              value={medication.alert}
              onValueChange={handleToggleAlert}
              trackColor={{ false: '#CBD5D1', true: PATIENT_COLORS.accent }}
              thumbColor={PATIENT_COLORS.white}
              accessibilityRole="switch"
              accessibilityLabel="Refill low supply alert toggle"
              accessibilityState={{ checked: medication.alert }}
            />
          </View>

          {/* Primary Action Buttons */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleEdit}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${medication.name}`}
          >
            <PatientIcon name="edit" size={22} color={PATIENT_COLORS.white} strokeWidth={2.2} />
            <Text style={styles.primaryActionText} allowFontScaling={true}>
              Edit Medication
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.ghostActionButton,
              isArmedDelete && styles.armedDeleteButton,
            ]}
            onPress={handleDelete}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={
              isArmedDelete
                ? 'Tap again to confirm deleting medicine'
                : 'Delete Medicine'
            }
          >
            <PatientIcon
              name="trash"
              size={22}
              color={isArmedDelete ? PATIENT_COLORS.white : PATIENT_COLORS.danger}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.ghostActionText,
                isArmedDelete && styles.armedDeleteText,
              ]}
              allowFontScaling={true}
            >
              {isArmedDelete ? 'Tap again to delete' : 'Delete Medicine'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeScreen>

      {/* Floating Bottom Nav - Medications remains highlighted */}
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
    paddingBottom: 88,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
    letterSpacing: -0.3,
  },
  heroCard: {
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#E4F5EC',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
  },
  pillArtContainer: {
    width: 160,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCE8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
    shadowColor: '#0F3D2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  pillArtGroove: {
    position: 'absolute',
    width: 2,
    height: 60,
    backgroundColor: '#C9D3CE',
  },
  strengthBadge: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    backgroundColor: PATIENT_COLORS.brand,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  strengthBadgeText: {
    color: PATIENT_COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    color: PATIENT_COLORS.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PATIENT_COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PATIENT_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
  },
  frequencyChip: {
    backgroundColor: PATIENT_COLORS.mint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  frequencyChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PATIENT_COLORS.brand,
  },
  sectionSub: {
    color: PATIENT_COLORS.muted,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  doseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },
  doseCardDone: {
    backgroundColor: PATIENT_COLORS.mint,
    borderColor: PATIENT_COLORS.mintBorder,
  },
  periodIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  doseInfoContainer: {
    flex: 1,
  },
  doseTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
  },
  doseMetaText: {
    fontSize: 13,
    color: PATIENT_COLORS.muted,
    marginTop: 2,
  },
  takenChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.mintBorder,
  },
  takenChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: PATIENT_COLORS.brand,
  },
  takeActionButton: {
    minHeight: 44,
    minWidth: 80,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeActionText: {
    color: PATIENT_COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  refillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PATIENT_COLORS.mint,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.mintBorder,
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    marginBottom: 16,
    gap: 12,
  },
  refillTextCol: {
    flex: 1,
  },
  refillTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
  },
  refillDesc: {
    fontSize: 13,
    color: PATIENT_COLORS.muted,
    marginTop: 2,
  },
  refillStock: {
    fontSize: 13,
    color: PATIENT_COLORS.deep,
    fontWeight: '600',
    marginTop: 4,
  },
  primaryActionButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PATIENT_COLORS.brand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 12,
  },
  primaryActionText: {
    color: PATIENT_COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  ghostActionButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.dangerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ghostActionText: {
    color: PATIENT_COLORS.danger,
    fontSize: 18,
    fontWeight: '800',
  },
  armedDeleteButton: {
    backgroundColor: PATIENT_COLORS.danger,
  },
  armedDeleteText: {
    color: PATIENT_COLORS.white,
  },
  notFoundCard: {
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
    gap: 18,
  },
  notFoundText: {
    fontSize: 16,
    color: PATIENT_COLORS.muted,
    textAlign: 'center',
    fontWeight: '600',
  },
});
