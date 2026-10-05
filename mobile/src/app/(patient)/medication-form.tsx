import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '../../components/auth/SafeScreen';
import Toast from '../../components/auth/Toast';
import PatientIcon from '../../components/patient/PatientIcons';
import MedicationImagePicker from '../../components/patient/MedicationImagePicker';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import {
  useMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  getTimePeriod,
  formatDaysSummary,
  DAY_NAMES_SHORT,
  Medication,
} from '../../services/medicationService';

type FormType = 'Tablet' | 'Capsule' | 'Syrup';
type MealType = 'Before food' | 'After food' | 'With meals' | 'Anytime';
type RepeatType = 'Daily' | 'Weekly' | 'Monthly';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const FORM_SUBTITLES: Record<FormType, string> = {
  Tablet: 'Solid pill',
  Capsule: 'Gel shell',
  Syrup: 'Liquid/Drop',
};

export default function MedicationFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const medications = useMedications();
  const editId = params.id ? String(params.id) : null;
  const isEditing = !!editId;

  // Form Fields State
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [form, setForm] = useState<FormType>('Tablet');
  const [qty, setQty] = useState(1);
  const [meal, setMeal] = useState<MealType>('After food');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [repeat, setRepeat] = useState<RepeatType>('Daily');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stock, setStock] = useState('30');
  const [alert, setAlert] = useState(true);
  const [image, setImage] = useState<string | undefined>(undefined);

  // Validation Error States
  const [nameError, setNameError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [daysError, setDaysError] = useState('');
  const [durationError, setDurationError] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isArmedDelete, setIsArmedDelete] = useState(false);
  const armTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (armTimerRef.current) clearTimeout(armTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Pre-fill fields if editing an existing medication
  useEffect(() => {
    if (editId) {
      const existing = medications.find(
        (m) => String(m.id) === editId || (m._id && String(m._id) === editId)
      );
      if (existing) {
        setName(existing.name);
        setPurpose(existing.purpose || '');
        setForm(existing.form);
        setQty(existing.qty || 1);
        setMeal((existing.meal as MealType) || 'After food');
        setTimes(existing.times && existing.times.length > 0 ? existing.times : ['08:00']);
        setDays(Array.isArray(existing.days) && existing.days.length > 0 ? existing.days : [0, 1, 2, 3, 4, 5, 6]);
        setRepeat((existing.repeat as RepeatType) || 'Daily');
        setStart(existing.start || '');
        setEnd(existing.end || '');
        setStock(String(existing.stock ?? 30));
        setAlert(existing.alert !== undefined ? existing.alert : true);
        setImage(existing.image || '');
      }
    }
  }, [editId, medications]);

  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) setNameError('');
  };

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.min(10, Math.max(1, prev + delta)));
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated);
    if (timeError) setTimeError('');
  };

  const handleAddTime = () => {
    const defaultTime = times.length === 1 ? '18:00' : times.length === 2 ? '12:00' : '20:00';
    setTimes([...times, defaultTime]);
    if (timeError) setTimeError('');
  };

  const handleRemoveTime = (index: number) => {
    if (times.length <= 1) return;
    const updated = times.filter((_, i) => i !== index);
    setTimes(updated);
  };

  const handleToggleDay = (dayIndex: number) => {
    setDays((prev) => {
      const updated = prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b);
      if (updated.length > 0 && daysError) setDaysError('');
      return updated;
    });
  };

  const validate = (): boolean => {
    let isValid = true;

    // 1. Medicine Name
    const cleanName = name.trim();
    if (!cleanName) {
      setNameError('Enter the medicine name.');
      isValid = false;
    } else {
      setNameError('');
    }

    // 2. Intake Times
    const validTimes = times.map((t) => t.trim()).filter(Boolean);
    if (validTimes.length === 0) {
      setTimeError('Add at least one reminder time.');
      isValid = false;
    } else {
      const hasInvalidFormat = validTimes.some((t) => !TIME_REGEX.test(t));
      if (hasInvalidFormat) {
        setTimeError('Times must be in 24-hour format (e.g. 08:00, 18:30).');
        isValid = false;
      } else {
        setTimeError('');
      }
    }

    // 3. Days of Week
    if (days.length === 0) {
      setDaysError('Pick at least one day.');
      isValid = false;
    } else {
      setDaysError('');
    }

    // 4. Treatment Duration (Optional, but end must be on or after start)
    const cleanStart = start.trim();
    const cleanEnd = end.trim();
    if (cleanStart && cleanEnd && cleanEnd < cleanStart) {
      setDurationError('End date must be on or after the start date.');
      isValid = false;
    } else {
      setDurationError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    try {
      const cleanTimes = [...new Set(times.map((t) => t.trim()))].sort();
      const stockNumber = Math.max(0, parseInt(stock, 10) || 0);

      if (isEditing && editId) {
        await updateMedication(editId, {
          name: name.trim(),
          purpose: purpose.trim(),
          form,
          qty,
          meal,
          times: cleanTimes,
          days,
          repeat,
          start: start.trim(),
          end: end.trim(),
          stock: stockNumber,
          alert,
          image: image || '',
        });
        showToast('Medication updated');
        setTimeout(() => {
          router.back();
        }, 350);
      } else {
        await addMedication({
          name: name.trim(),
          purpose: purpose.trim(),
          form,
          qty,
          meal,
          times: cleanTimes,
          days,
          repeat,
          start: start.trim(),
          end: end.trim(),
          stock: stockNumber,
          alert,
          image: image || '',
        });
        showToast('Medication added');
        setTimeout(() => {
          router.replace('/(patient)/medications' as any);
        }, 350);
      }
    } catch (e: any) {
      showToast(e.message || 'Error saving medication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;

    if (isArmedDelete) {
      if (armTimerRef.current) clearTimeout(armTimerRef.current);
      setIsArmedDelete(false);
      try {
        await deleteMedication(editId);
        showToast('Medication deleted');
        setTimeout(() => {
          router.replace('/(patient)/medications' as any);
        }, 350);
      } catch (e) {
        showToast('Error deleting medication');
      }
    } else {
      setIsArmedDelete(true);
      if (armTimerRef.current) clearTimeout(armTimerRef.current);
      armTimerRef.current = setTimeout(() => {
        setIsArmedDelete(false);
      }, 3000);
    }
  };

  const unitLabel = form === 'Syrup' ? 'Dose' : form;

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
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <PatientIcon name="back" size={20} color={PATIENT_COLORS.deep} strokeWidth={2.4} />
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <Text style={styles.title} allowFontScaling={true}>
                {isEditing ? 'Edit Medicine' : 'Add Medicine Details'}
              </Text>
              <Text style={styles.subTitle} allowFontScaling={true}>
                {isEditing
                  ? 'Update details and reminder times'
                  : 'Enter the medicine details'}
              </Text>
            </View>
          </View>

          {/* Medication Photo Picker */}
          <MedicationImagePicker
            value={image}
            onChange={(uri) => setImage(uri || '')}
          />

          {/* 1. Medicine Name (Required) */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Medicine name
          </Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            placeholder="e.g. Metformin 500mg"
            placeholderTextColor={PATIENT_COLORS.ph}
            value={name}
            onChangeText={handleNameChange}
            accessibilityLabel="Medicine name"
            allowFontScaling={true}
          />
          {!!nameError && (
            <Text style={styles.errorText} allowFontScaling={true}>
              {nameError}
            </Text>
          )}

          {/* 2. Treatment Purpose */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Treatment purpose
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Diabetes management"
            placeholderTextColor={PATIENT_COLORS.ph}
            value={purpose}
            onChangeText={setPurpose}
            accessibilityLabel="Treatment purpose"
            allowFontScaling={true}
          />

          {/* 3. Form of Medicine (3 Cards: Tablet, Capsule, Syrup) */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Form of medicine
          </Text>
          <View style={styles.formCardsRow} accessibilityRole="radiogroup">
            {(['Tablet', 'Capsule', 'Syrup'] as FormType[]).map((f) => {
              const isSelected = form === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.formCard,
                    isSelected && styles.formCardActive,
                  ]}
                  onPress={() => setForm(f)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${f}, ${FORM_SUBTITLES[f]}`}
                >
                  {isSelected && (
                    <View style={styles.formCardCheck}>
                      <PatientIcon name="check" size={14} color={PATIENT_COLORS.white} strokeWidth={2.8} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.formCardTitle,
                      isSelected && styles.formCardTitleActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {f}
                  </Text>
                  <Text
                    style={[
                      styles.formCardSub,
                      isSelected && styles.formCardSubActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {FORM_SUBTITLES[f]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4. Dosage Stepper (1-10) */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Dosage per intake
          </Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleQtyChange(-1)}
              activeOpacity={0.7}
              disabled={qty <= 1}
              accessibilityRole="button"
              accessibilityLabel="Decrease dose quantity"
            >
              <PatientIcon
                name="minus"
                size={22}
                color={qty <= 1 ? PATIENT_COLORS.muted : PATIENT_COLORS.brand}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            <Text style={styles.stepperValueText} allowFontScaling={true}>
              {qty} {unitLabel}{qty > 1 ? 's' : ''}
            </Text>

            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => handleQtyChange(1)}
              activeOpacity={0.7}
              disabled={qty >= 10}
              accessibilityRole="button"
              accessibilityLabel="Increase dose quantity"
            >
              <PatientIcon
                name="plus"
                size={22}
                color={qty >= 10 ? PATIENT_COLORS.muted : PATIENT_COLORS.brand}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          </View>

          {/* 5. Take / Meal Timing */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Take
          </Text>
          <View style={styles.segmentedRow} accessibilityRole="radiogroup">
            {(['Before food', 'After food', 'With meals', 'Anytime'] as MealType[]).map((m) => {
              const isSelected = meal === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.segmentButtonSm,
                    isSelected && styles.segmentButtonActive,
                  ]}
                  onPress={() => setMeal(m)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Take ${m}`}
                >
                  <Text
                    style={[
                      styles.segmentTextSm,
                      isSelected && styles.segmentTextActive,
                    ]}
                    allowFontScaling={true}
                    numberOfLines={1}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 6. Intake Time & Schedule */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Intake time & schedule
          </Text>
          {times.map((t, idx) => {
            const period = getTimePeriod(t);
            return (
              <View key={idx} style={styles.timeRow}>
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    value={t}
                    onChange={(e: any) => handleTimeChange(idx, e.target.value)}
                    style={{
                      flex: 1,
                      height: 56,
                      padding: '0 16px',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 18,
                      backgroundColor: '#FFFFFF',
                      fontSize: 16,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    aria-label={`Reminder time ${idx + 1}`}
                  />
                ) : (
                  <TextInput
                    style={[styles.input, styles.timeInput]}
                    value={t}
                    onChangeText={(val) => handleTimeChange(idx, val)}
                    placeholder="HH:MM (e.g. 08:00)"
                    placeholderTextColor={PATIENT_COLORS.ph}
                    maxLength={5}
                    accessibilityLabel={`Reminder time ${idx + 1}`}
                    allowFontScaling={true}
                  />
                )}

                <View style={styles.periodChip}>
                  <Text style={styles.periodChipText} allowFontScaling={true}>
                    {period}
                  </Text>
                </View>

                {times.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeTimeButton}
                    onPress={() => handleRemoveTime(idx)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove reminder time ${idx + 1}`}
                  >
                    <PatientIcon
                      name="trash"
                      size={20}
                      color={PATIENT_COLORS.danger}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {!!timeError && (
            <Text style={styles.errorText} allowFontScaling={true}>
              {timeError}
            </Text>
          )}

          {/* Add Another Intake Time Button */}
          <TouchableOpacity
            style={styles.addTimeDashedBtn}
            onPress={handleAddTime}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Add another intake time"
          >
            <Text style={styles.addTimeDashedText} allowFontScaling={true}>
              + Add another intake time
            </Text>
          </TouchableOpacity>

          {/* 7. Days of Week */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Days of week • {formatDaysSummary(days)}
          </Text>
          <View style={styles.daysRow} accessibilityRole="toolbar">
            {DAY_NAMES_SHORT.map((dayName, idx) => {
              const isSelected = days.includes(idx);
              return (
                <TouchableOpacity
                  key={dayName}
                  style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                  onPress={() => handleToggleDay(idx)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${dayName} toggle`}
                >
                  <Text
                    style={[styles.dayButtonText, isSelected && styles.dayButtonTextActive]}
                    allowFontScaling={true}
                  >
                    {dayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!!daysError && (
            <Text style={styles.errorText} allowFontScaling={true}>
              {daysError}
            </Text>
          )}

          {/* 8. Repeat Frequency */}
          <Text style={[styles.fieldLabel, { marginTop: 14 }]} allowFontScaling={true}>
            Repeat
          </Text>
          <View style={styles.segmentedRow} accessibilityRole="radiogroup">
            {(['Daily', 'Weekly', 'Monthly'] as RepeatType[]).map((r) => {
              const isSelected = repeat === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentButtonActive,
                  ]}
                  onPress={() => setRepeat(r)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={r}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 9. Treatment Duration (Optional) */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Treatment duration (optional)
          </Text>
          <View style={styles.durationRow}>
            <View style={{ flex: 1 }}>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={start}
                  onChange={(e: any) => {
                    setStart(e.target.value);
                    if (durationError) setDurationError('');
                  }}
                  style={{
                    width: '100%',
                    height: 56,
                    padding: '0 14px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 18,
                    backgroundColor: '#FFFFFF',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  aria-label="Start date"
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Start (YYYY-MM-DD)"
                  placeholderTextColor={PATIENT_COLORS.ph}
                  value={start}
                  onChangeText={(val) => {
                    setStart(val);
                    if (durationError) setDurationError('');
                  }}
                  accessibilityLabel="Start date"
                  allowFontScaling={true}
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={end}
                  onChange={(e: any) => {
                    setEnd(e.target.value);
                    if (durationError) setDurationError('');
                  }}
                  style={{
                    width: '100%',
                    height: 56,
                    padding: '0 14px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 18,
                    backgroundColor: '#FFFFFF',
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  aria-label="End date"
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="End (YYYY-MM-DD)"
                  placeholderTextColor={PATIENT_COLORS.ph}
                  value={end}
                  onChangeText={(val) => {
                    setEnd(val);
                    if (durationError) setDurationError('');
                  }}
                  accessibilityLabel="End date"
                  allowFontScaling={true}
                />
              )}
            </View>
          </View>
          {!!durationError && (
            <Text style={styles.errorText} allowFontScaling={true}>
              {durationError}
            </Text>
          )}

          {/* 10. Pills in Stock */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Pills in stock
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g. 30"
            placeholderTextColor={PATIENT_COLORS.ph}
            value={stock}
            onChangeText={setStock}
            accessibilityLabel="Pills in stock"
            allowFontScaling={true}
          />

          {/* 11. Refill Low-Supply Alert Switch */}
          <View style={styles.switchCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle} allowFontScaling={true}>
                Refill low-supply alert
              </Text>
              <Text style={styles.switchSub} allowFontScaling={true}>
                Remind me when 5 pills remaining
              </Text>
            </View>
            <Switch
              value={alert}
              onValueChange={setAlert}
              trackColor={{ false: '#CBD5D1', true: PATIENT_COLORS.accent }}
              thumbColor={PATIENT_COLORS.white}
              accessibilityRole="switch"
              accessibilityLabel="Refill low-supply alert switch"
              accessibilityState={{ checked: alert }}
            />
          </View>

          {/* 12. Submit Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Update Changes' : 'Save Medication'}
          >
            {loading ? (
              <ActivityIndicator color={PATIENT_COLORS.white} />
            ) : (
              <>
                <PatientIcon name="check" size={22} color={PATIENT_COLORS.white} strokeWidth={2.6} />
                <Text style={styles.saveButtonText} allowFontScaling={true}>
                  {isEditing ? 'Update Changes' : 'Save Medication'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* 13. Delete Button (Edit mode only, 2-tap confirm) */}
          {isEditing && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                isArmedDelete && styles.deleteButtonArmed,
              ]}
              onPress={handleDelete}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={
                isArmedDelete ? 'Tap again to delete' : 'Delete Medicine'
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
                  styles.deleteButtonText,
                  isArmedDelete && styles.deleteButtonTextArmed,
                ]}
                allowFontScaling={true}
              >
                {isArmedDelete ? 'Tap again to delete' : 'Delete Medicine'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeScreen>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 14,
    color: PATIENT_COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  photoBox: {
    width: '100%',
    minHeight: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9ED8C0',
    borderRadius: 24,
    backgroundColor: '#F3FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 18,
    marginBottom: 16,
  },
  photoBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PATIENT_COLORS.brand,
  },
  photoBoxSub: {
    fontSize: 13,
    color: PATIENT_COLORS.muted,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginHorizontal: 4,
    marginBottom: 6,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 18,
    backgroundColor: PATIENT_COLORS.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    color: PATIENT_COLORS.text,
    fontWeight: '500',
    marginBottom: 14,
  },
  inputError: {
    borderColor: PATIENT_COLORS.danger,
    backgroundColor: PATIENT_COLORS.dangerBg,
  },
  errorText: {
    fontSize: 14,
    color: PATIENT_COLORS.danger,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 12,
    marginHorizontal: 6,
  },
  formCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  formCard: {
    flex: 1,
    minHeight: 84,
    borderWidth: 1.5,
    borderColor: PATIENT_COLORS.border,
    backgroundColor: PATIENT_COLORS.surface,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
    paddingVertical: 10,
  },
  formCardActive: {
    backgroundColor: PATIENT_COLORS.brand,
    borderColor: PATIENT_COLORS.brand,
  },
  formCardCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PATIENT_COLORS.text,
  },
  formCardTitleActive: {
    color: PATIENT_COLORS.white,
  },
  formCardSub: {
    fontSize: 12,
    color: PATIENT_COLORS.muted,
  },
  formCardSubActive: {
    color: '#D6EFE5',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PATIENT_COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueText: {
    fontSize: 17,
    fontWeight: '700',
    color: PATIENT_COLORS.deep,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    padding: 5,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonSm: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segmentButtonActive: {
    backgroundColor: PATIENT_COLORS.brand,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: PATIENT_COLORS.muted,
  },
  segmentTextSm: {
    fontSize: 13,
    fontWeight: '600',
    color: PATIENT_COLORS.muted,
  },
  segmentTextActive: {
    color: PATIENT_COLORS.white,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  periodChip: {
    backgroundColor: PATIENT_COLORS.mint,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PATIENT_COLORS.brand,
  },
  removeTimeButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: PATIENT_COLORS.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeDashedBtn: {
    width: '100%',
    minHeight: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#9ED8C0',
    borderRadius: 18,
    backgroundColor: '#F6FBF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  addTimeDashedText: {
    color: PATIENT_COLORS.brand,
    fontWeight: '700',
    fontSize: 15,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 6,
  },
  dayButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1.5,
    borderColor: PATIENT_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: PATIENT_COLORS.brand,
    borderColor: PATIENT_COLORS.brand,
  },
  dayButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: PATIENT_COLORS.muted,
  },
  dayButtonTextActive: {
    color: PATIENT_COLORS.white,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    gap: 12,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PATIENT_COLORS.deep,
  },
  switchSub: {
    fontSize: 13,
    color: PATIENT_COLORS.muted,
    marginTop: 2,
  },
  saveButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PATIENT_COLORS.brand,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 12,
  },
  saveButtonText: {
    color: PATIENT_COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButton: {
    width: '100%',
    height: 58,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.dangerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonArmed: {
    backgroundColor: PATIENT_COLORS.danger,
  },
  deleteButtonText: {
    color: PATIENT_COLORS.danger,
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButtonTextArmed: {
    color: PATIENT_COLORS.white,
  },
});
