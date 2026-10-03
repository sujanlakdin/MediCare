import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import SafeScreen from '../../components/auth/SafeScreen';
import Toast from '../../components/auth/Toast';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import {
  useMedications,
  addMedication,
  updateMedication,
  deleteMedication,
} from '../../services/medicationService';
import PatientIcon from '../../components/patient/PatientIcons';

type FormType = 'Tablet' | 'Capsule' | 'Syrup';
type RepeatType = 'Daily' | 'Weekly' | 'Monthly';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function MedicationFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const medications = useMedications();
  const editId = id ? Number(id) : null;
  const isEditing = !!editId;

  // Form states
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [form, setForm] = useState<FormType>('Tablet');
  const [qty, setQty] = useState(1);
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [repeat, setRepeat] = useState<RepeatType>('Daily');
  const [stock, setStock] = useState('30');

  // Error states
  const [nameError, setNameError] = useState('');
  const [timeError, setTimeError] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isArmedDelete, setIsArmedDelete] = useState(false);
  const armTimerRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Pre-fill if editing
  useEffect(() => {
    if (editId) {
      const existing = medications.find((m) => m.id === editId);
      if (existing) {
        setName(existing.name);
        setPurpose(existing.purpose || '');
        setForm(existing.form);
        setQty(existing.qty);
        setTimes(existing.times.length > 0 ? existing.times : ['08:00']);
        setRepeat(existing.repeat);
        setStock(String(existing.stock));
      }
    }
  }, [editId, medications]);

  // Clean errors on input
  const handleNameChange = (text: string) => {
    setName(text);
    if (nameError) setNameError('');
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...times];
    updated[index] = val;
    setTimes(updated);
    if (timeError) setTimeError('');
  };

  const handleAddTime = () => {
    const defaultTime = times.length === 1 ? '18:00' : '12:00';
    setTimes([...times, defaultTime]);
    if (timeError) setTimeError('');
  };

  const handleRemoveTime = (index: number) => {
    if (times.length <= 1) return;
    const updated = times.filter((_, i) => i !== index);
    setTimes(updated);
  };

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.min(10, Math.max(1, prev + delta)));
  };

  const validate = (): boolean => {
    let isValid = true;
    const cleanName = name.trim();

    if (!cleanName) {
      setNameError('Enter the medicine name.');
      isValid = false;
    } else {
      setNameError('');
    }

    const validTimes = times.map((t) => t.trim()).filter(Boolean);
    if (validTimes.length === 0) {
      setTimeError('Add at least one reminder time.');
      isValid = false;
    } else {
      const hasInvalidFormat = validTimes.some((t) => !TIME_REGEX.test(t));
      if (hasInvalidFormat) {
        setTimeError('Times must be in 24-hour HH:MM format (e.g. 08:00 or 18:30).');
        isValid = false;
      } else {
        setTimeError('');
      }
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
          times: cleanTimes,
          repeat,
          stock: stockNumber,
        });
        showToast('Medication updated');
      } else {
        await addMedication({
          name: name.trim(),
          purpose: purpose.trim(),
          form,
          qty,
          times: cleanTimes,
          repeat,
          stock: stockNumber,
        });
        showToast('Medication added');
      }

      setTimeout(() => {
        router.back();
      }, 350);
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

  return (
    <View style={styles.outerContainer}>
      <SafeScreen
        style={styles.safeArea}
        backgroundColor={PATIENT_COLORS.background}
        barStyle="dark-content"
        contentContainerStyle={styles.safeContent}
      >
        <View style={styles.mainContent}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Back to medications"
            >
              <PatientIcon name="back" size={22} color={PATIENT_COLORS.text} />
            </TouchableOpacity>

            <View style={styles.headerTitles}>
              <Text style={styles.title} allowFontScaling={true}>
                {isEditing ? 'Edit Medication' : 'Add Medication'}
              </Text>
              <Text style={styles.subTitle} allowFontScaling={true}>
                {isEditing
                  ? 'Update details and reminder times'
                  : 'Enter the medicine details'}
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          {/* 1. Medicine Name */}
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

          {/* 3. Form (Segmented Control) */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Form
          </Text>
          <View style={styles.segmentedRow} accessibilityRole="radiogroup">
            {(['Tablet', 'Capsule', 'Syrup'] as FormType[]).map((f) => {
              const isSelected = form === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.segmentButton,
                    isSelected && styles.segmentButtonActive,
                  ]}
                  onPress={() => setForm(f)}
                  activeOpacity={0.75}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={f}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isSelected && styles.segmentTextActive,
                    ]}
                    allowFontScaling={true}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4. Dose Stepper */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Dose per intake
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
              />
            </TouchableOpacity>

            <Text style={styles.stepperValueText} allowFontScaling={true}>
              {qty} {form}
              {qty > 1 ? 's' : ''}
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
              />
            </TouchableOpacity>
          </View>

          {/* 5. Reminder Times */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Reminder times
          </Text>
          {times.map((t, idx) => (
            <View key={idx} style={styles.timeRow}>
              {Platform.OS === 'web' ? (
                // Web native time picker input
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
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {!!timeError && (
            <Text style={styles.errorText} allowFontScaling={true}>
              {timeError}
            </Text>
          )}

          {/* Add Another Time Button */}
          <TouchableOpacity
            style={styles.addTimeDashedBtn}
            onPress={handleAddTime}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Add another reminder time"
          >
            <Text style={styles.addTimeDashedText} allowFontScaling={true}>
              + Add another time
            </Text>
          </TouchableOpacity>

          {/* 6. Repeat (Segmented Control) */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
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

          {/* 7. Pills in Stock */}
          <Text style={styles.fieldLabel} allowFontScaling={true}>
            Pills in stock (refill alert at 7)
          </Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
            placeholder="e.g. 30"
            placeholderTextColor={PATIENT_COLORS.ph}
            accessibilityLabel="Pills in stock"
            allowFontScaling={true}
          />

          {/* Save / Update Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Update Changes' : 'Save Medication'}
            accessibilityState={{ busy: loading }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={PATIENT_COLORS.white} />
            ) : (
              <>
                <PatientIcon
                  name="check"
                  size={22}
                  color={PATIENT_COLORS.white}
                  strokeWidth={2.4}
                />
                <Text style={styles.saveButtonText} allowFontScaling={true}>
                  {isEditing ? 'Update Changes' : 'Save Medication'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Delete Button (Edit Mode Only) */}
          {isEditing && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                isArmedDelete && styles.deleteButtonArmed,
              ]}
              onPress={handleDelete}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                isArmedDelete ? 'Tap again to delete' : 'Delete Medicine'
              }
            >
              <PatientIcon
                name="trash"
                size={20}
                color={
                  isArmedDelete ? PATIENT_COLORS.white : PATIENT_COLORS.danger
                }
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
        </View>
      </SafeScreen>

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
    paddingBottom: 40,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
    width: '100%',
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 18,
    backgroundColor: PATIENT_COLORS.surface,
    fontSize: 16,
    fontWeight: '500',
    color: PATIENT_COLORS.text,
    marginBottom: 14,
  },
  inputError: {
    borderColor: PATIENT_COLORS.danger,
    backgroundColor: PATIENT_COLORS.dangerBg,
  },
  errorText: {
    color: PATIENT_COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
    marginTop: -8,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 6,
    padding: 5,
    backgroundColor: PATIENT_COLORS.surface,
    borderWidth: 1,
    borderColor: PATIENT_COLORS.border,
    borderRadius: 20,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: PATIENT_COLORS.brand,
  },
  segmentText: {
    fontWeight: '600',
    fontSize: 15,
    color: PATIENT_COLORS.muted,
  },
  segmentTextActive: {
    color: PATIENT_COLORS.white,
    fontWeight: '700',
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
    paddingHorizontal: 14,
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
    color: PATIENT_COLORS.text,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
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
    borderColor: PATIENT_COLORS.addTimeBorder,
    borderRadius: 18,
    backgroundColor: PATIENT_COLORS.addTimeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  addTimeDashedText: {
    color: PATIENT_COLORS.brand,
    fontWeight: '700',
    fontSize: 16,
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
    marginTop: 8,
    shadowColor: PATIENT_COLORS.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  saveButtonText: {
    color: PATIENT_COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  deleteButton: {
    width: '100%',
    height: 56,
    borderRadius: 999,
    backgroundColor: PATIENT_COLORS.dangerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  deleteButtonArmed: {
    backgroundColor: PATIENT_COLORS.danger,
  },
  deleteButtonText: {
    color: PATIENT_COLORS.danger,
    fontSize: 17,
    fontWeight: '700',
  },
  deleteButtonTextArmed: {
    color: PATIENT_COLORS.white,
  },
});
