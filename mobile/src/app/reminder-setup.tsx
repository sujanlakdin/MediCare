import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, MaxContentWidth } from '@/constants/theme';
import {
  useMedicareStore,
  createMedication,
  updateMedication,
  deleteMedication,
  createReminder,
  updateReminder,
  deleteReminder,
  getTimeOfDayGroup,
  RepeatOption,
  goBackTo,
} from '@/medicare';

export default function ReminderSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; medicationId?: string; from?: string }>();
  const medId = params.id || params.medicationId;
  const isEditing = Boolean(medId);

  const { medications, reminders } = useMedicareStore();

  // Find medication and reminder if editing
  const existingMed = isEditing ? medications.find((m) => m.id === medId) : null;
  const existingReminder = isEditing ? reminders.find((r) => r.medicationId === medId) : null;

  // Form states
  const [medName, setMedName] = useState<string>('');
  const [dose, setDose] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('08:00 AM');
  const [frequency, setFrequency] = useState<RepeatOption>('Every Day');
  const [startDate, setStartDate] = useState<string>('2026-10-24');
  const [notificationSound, setNotificationSound] = useState<string>('Morning Dew');
  const [isSnoozeEnabled, setIsSnoozeEnabled] = useState<boolean>(true);
  const [note, setNote] = useState<string>('');

  // Track if user changed date (for edit mode rule 2)
  const [dateChanged, setDateChanged] = useState<boolean>(false);

  // Validation feedback state
  const [hasAttemptedSave, setHasAttemptedSave] = useState<boolean>(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>('');

  // Modals state
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [showRepeatModal, setShowRepeatModal] = useState<boolean>(false);

  // Temporary picker state
  const [pickerHour, setPickerHour] = useState<number>(8);
  const [pickerMinute, setPickerMinute] = useState<string>('00');
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>('AM');

  // Calendar picker state
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(24);

  // Populate data if editing
  useEffect(() => {
    if (existingMed) {
      setMedName(existingMed.name);
      setDose(existingMed.dose);
      setInstructions(existingMed.instructions);
    }
    if (existingReminder) {
      setSelectedTime(existingReminder.time);
      setFrequency(existingReminder.repeat);
      setStartDate(existingReminder.startDate);
      setIsSnoozeEnabled(existingReminder.snoozeEnabled);
      setNote(existingReminder.note || '');
      if (existingReminder.notificationSound) {
        setNotificationSound(existingReminder.notificationSound);
      }
    }
  }, [existingMed?.id, existingReminder?.id]);

  // Back navigation using goBackTo
  const handleBack = () => {
    goBackTo(router, params.from, medId);
  };

  // Validation rules
  // 1. Medication name required (2 to 40 chars)
  let nameError = '';
  const trimmedName = medName.trim();
  if (trimmedName.length === 0) {
    nameError = 'Medication name is required';
  } else if (trimmedName.length < 2 || trimmedName.length > 40) {
    nameError = 'Name must be between 2 and 40 characters';
  }

  // 2. Dose required
  let doseError = '';
  const trimmedDose = dose.trim();
  if (trimmedDose.length === 0) {
    doseError = 'Dose is required';
  }

  // 3. Time required
  let timeError = '';
  if (!selectedTime.trim()) {
    timeError = 'Reminder time is required';
  }

  // 4. Date cannot be in the past: ONLY applies in create mode or when user changed date
  let dateError = '';
  const shouldCheckDatePast = !isEditing || dateChanged;
  if (shouldCheckDatePast && startDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = startDate.split('-');
    if (parts.length === 3) {
      const parsedDate = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      parsedDate.setHours(0, 0, 0, 0);
      if (parsedDate.getTime() < today.getTime()) {
        dateError = 'Start date cannot be in the past';
      }
    }
  }

  // 5. Note max 200 characters
  let noteError = '';
  if (note.length > 200) {
    noteError = 'Note cannot exceed 200 characters';
  }

  // 6. Duplicate check (same medication, same time) - MUST exclude its own reminder id
  let duplicateError = '';
  const isDuplicate = reminders.some((r) => {
    // Exclude the reminder being edited
    if (isEditing && existingReminder && r.id === existingReminder.id) {
      return false;
    }

    const isSameTime = r.time.trim().toLowerCase() === selectedTime.trim().toLowerCase();
    if (!isSameTime) return false;

    // Check if another reminder exists for this medication
    if (isEditing && medId && r.medicationId === medId) {
      return true;
    }

    // Check by medication name
    const matchingMed = medications.find((m) => m.id === r.medicationId);
    if (
      matchingMed &&
      matchingMed.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
      (!isEditing || matchingMed.id !== medId)
    ) {
      return true;
    }

    return false;
  });

  if (isDuplicate) {
    duplicateError = 'A reminder for this medication at this time already exists';
  }

  const activeErrors = [
    nameError,
    doseError,
    timeError,
    dateError,
    noteError,
    duplicateError,
  ].filter(Boolean);

  const isValid = activeErrors.length === 0;

  // Open Time Picker Modal
  const openTimePicker = () => {
    const match = selectedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      setPickerHour(parseInt(match[1], 10));
      setPickerMinute(match[2]);
      setPickerPeriod((match[3] || 'AM').toUpperCase() as 'AM' | 'PM');
    }
    setShowTimeModal(true);
  };

  const confirmTimePicker = () => {
    const formatted = `${String(pickerHour).padStart(2, '0')}:${pickerMinute} ${pickerPeriod}`;
    setSelectedTime(formatted);
    setShowTimeModal(false);
  };

  // Open Date Picker Modal
  const openDatePicker = () => {
    const parts = startDate.split('-');
    if (parts.length === 3) {
      setCalendarYear(parseInt(parts[0], 10));
      setCalendarMonth(parseInt(parts[1], 10) - 1);
      setSelectedCalendarDay(parseInt(parts[2], 10));
    }
    setShowDateModal(true);
  };

  const confirmDatePicker = () => {
    const formatted = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(
      selectedCalendarDay
    ).padStart(2, '0')}`;
    setStartDate(formatted);
    setDateChanged(true); // User explicitly changed date
    setShowDateModal(false);
  };

  // Month navigation for calendar
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // Save Reminder Handler
  const handleSaveReminder = async () => {
    setHasAttemptedSave(true);
    setSaveErrorMessage('');

    if (!isValid) {
      return;
    }

    try {
      const timeGroup = getTimeOfDayGroup(selectedTime);

      if (isEditing && medId) {
        // Update existing medication and reminder
        await updateMedication(medId, {
          name: trimmedName,
          dose: trimmedDose,
          instructions: instructions.trim(),
          timeOfDayGroup: timeGroup,
        });

        if (existingReminder) {
          await updateReminder(existingReminder.id, {
            time: selectedTime,
            repeat: frequency,
            startDate,
            snoozeEnabled: isSnoozeEnabled,
            note: note.trim(),
            notificationSound,
          });
        } else {
          await createReminder({
            medicationId: medId,
            time: selectedTime,
            repeat: frequency,
            startDate,
            snoozeEnabled: isSnoozeEnabled,
            note: note.trim(),
            notificationSound,
          });
        }
      } else {
        // Create new medication and reminder
        const newMed = await createMedication({
          name: trimmedName,
          dose: trimmedDose,
          instructions: instructions.trim(),
          timeOfDayGroup: timeGroup,
          iconType: 'pill',
        });

        await createReminder({
          medicationId: newMed.id,
          time: selectedTime,
          repeat: frequency,
          startDate,
          snoozeEnabled: isSnoozeEnabled,
          note: note.trim(),
          notificationSound,
        });
      }

      // Save -> navigate to /medication-schedule (do not use router.back())
      router.navigate({ pathname: '/medication-schedule' });
    } catch (err: any) {
      console.error('Save error:', err);
      setSaveErrorMessage(err?.message || 'Failed to save reminder. Please try again.');
    }
  };

  // Delete Reminder Handler
  const handleDeleteReminder = () => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete the reminder for ${trimmedName || 'this medication'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (existingReminder) {
                await deleteReminder(existingReminder.id);
              }
              if (medId) {
                await deleteMedication(medId);
              }
              // Delete -> navigate to /medication-schedule
              router.navigate({ pathname: '/medication-schedule' });
            } catch (err: any) {
              setSaveErrorMessage(err?.message || 'Failed to delete reminder.');
            }
          },
        },
      ]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'Setup Reminder Help',
      'Customize your dose alerts, sound preferences, and snooze intervals to stay on track with your prescription regimen.'
    );
  };

  // Calendar math
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false, title: '' }} />
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color="#154D38" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Reminder' : 'Setup Reminder'}
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleHelpPress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Help"
          accessibilityRole="button">
          <Ionicons name="help-circle-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Medication Info Card */}
          <View style={styles.medicationCard}>
            <View style={styles.medicationLeft}>
              <View style={styles.pillIconContainer}>
                <MaterialCommunityIcons name="pill" size={26} color="#10B981" />
              </View>
              <View style={styles.medicationInfo}>
                <TextInput
                  style={styles.medicationNameInput}
                  placeholder="Medication name (e.g. Lisinopril)"
                  placeholderTextColor="#94A3B8"
                  value={medName}
                  onChangeText={(val) => {
                    setMedName(val);
                    setSaveErrorMessage('');
                  }}
                  maxLength={50}
                />
                <TextInput
                  style={styles.medicationDosageInput}
                  placeholder="Dose (e.g. 10mg Tablet)"
                  placeholderTextColor="#94A3B8"
                  value={dose}
                  onChangeText={(val) => {
                    setDose(val);
                    setSaveErrorMessage('');
                  }}
                  maxLength={40}
                />
              </View>
            </View>
          </View>

          {/* Inline Validation Errors for Medication */}
          {nameError && hasAttemptedSave ? (
            <Text style={styles.inlineErrorText}>{nameError}</Text>
          ) : null}
          {doseError && hasAttemptedSave ? (
            <Text style={styles.inlineErrorText}>{doseError}</Text>
          ) : null}

          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SCHEDULE</Text>

            {/* Time Row */}
            <TouchableOpacity
              style={[styles.itemCard, (timeError || duplicateError) && hasAttemptedSave && styles.itemCardError]}
              onPress={openTimePicker}
              activeOpacity={0.7}>
              <Ionicons name="time-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>{selectedTime || 'Select time'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
            {timeError && hasAttemptedSave ? (
              <Text style={styles.inlineErrorText}>{timeError}</Text>
            ) : null}
            {duplicateError && hasAttemptedSave ? (
              <Text style={styles.inlineErrorText}>{duplicateError}</Text>
            ) : null}

            {/* Frequency / Repeat Row */}
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => setShowRepeatModal(true)}
              activeOpacity={0.7}>
              <Ionicons name="repeat-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>{frequency}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Date Row */}
            <TouchableOpacity
              style={[styles.itemCard, dateError && hasAttemptedSave && styles.itemCardError]}
              onPress={openDatePicker}
              activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={20} color="#64748B" />
              <Text style={styles.itemLabel}>Starts: {startDate}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
            {dateError && hasAttemptedSave ? (
              <Text style={styles.inlineErrorText}>{dateError}</Text>
            ) : null}
          </View>

          {/* Notification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>NOTIFICATION</Text>

            {/* Sound Row */}
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => {
                Alert.alert('Notification Tone', `Current sound: ${notificationSound}`);
              }}
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
              <TextInput
                style={styles.instructionsInput}
                placeholder="Enter instructions (e.g. Take with a full glass of water. Can be taken with or without food.)"
                placeholderTextColor="#94A3B8"
                multiline
                value={instructions}
                onChangeText={setInstructions}
              />
            </View>
          </View>

          {/* Note Section with Live Counter */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>NOTE</Text>
              <Text
                style={[
                  styles.counterText,
                  note.length > 200 && styles.counterTextError,
                ]}>
                {note.length}/200
              </Text>
            </View>
            <View style={[styles.noteCard, noteError && hasAttemptedSave && styles.itemCardError]}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add an optional note (e.g. Take with breakfast)"
                placeholderTextColor="#94A3B8"
                multiline
                value={note}
                onChangeText={(val) => {
                  setNote(val);
                  setSaveErrorMessage('');
                }}
              />
            </View>
            {noteError && hasAttemptedSave ? (
              <Text style={styles.inlineErrorText}>{noteError}</Text>
            ) : null}
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

          {/* Delete Button on Edit Screen */}
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteReminder}
              activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" style={styles.deleteIcon} />
              <Text style={styles.deleteButtonText}>Delete Reminder</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Docked Save Reminder Button Container */}
      <View style={styles.bottomDockContainer}>
        <View style={styles.bottomDockWrapper}>
          {/* Visible Red Error Banner if save throws */}
          {saveErrorMessage ? (
            <View style={styles.saveErrorBox}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.saveErrorBoxText}>{saveErrorMessage}</Text>
            </View>
          ) : null}

          {/* Visible Validation Errors Near Save so user can see why save didn't run */}
          {hasAttemptedSave && activeErrors.length > 0 && (
            <View style={styles.saveErrorsContainer}>
              <Text style={styles.saveErrorsHeader}>Please resolve the following:</Text>
              {activeErrors.map((err, idx) => (
                <View key={idx} style={styles.saveErrorRow}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.saveErrorText}>{err}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              hasAttemptedSave && !isValid && styles.saveButtonInvalid,
            ]}
            onPress={handleSaveReminder}
            activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Save Reminder'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ----------------- TIME PICKER MODAL ----------------- */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Reminder Time</Text>
            <Text style={styles.modalSubtitle}>
              {String(pickerHour).padStart(2, '0')}:{pickerMinute} {pickerPeriod}
            </Text>

            {/* Time Columns */}
            <View style={styles.timePickerRow}>
              {/* Hour Selection */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColHeader}>Hour</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.pickerItem,
                        pickerHour === h && styles.pickerItemSelected,
                      ]}
                      onPress={() => setPickerHour(h)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          pickerHour === h && styles.pickerItemTextSelected,
                        ]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minute Selection */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColHeader}>Minute</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(
                    (m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.pickerItem,
                          pickerMinute === m && styles.pickerItemSelected,
                        ]}
                        onPress={() => setPickerMinute(m)}>
                        <Text
                          style={[
                            styles.pickerItemText,
                            pickerMinute === m && styles.pickerItemTextSelected,
                          ]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>

              {/* AM/PM Selection */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColHeader}>Period</Text>
                <View style={styles.periodColContainer}>
                  {(['AM', 'PM'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.pickerItem,
                        pickerPeriod === p && styles.pickerItemSelected,
                        styles.periodItem,
                      ]}
                      onPress={() => setPickerPeriod(p)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          pickerPeriod === p && styles.pickerItemTextSelected,
                        ]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowTimeModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmTimePicker}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------- DATE PICKER MODAL (Month Calendar Grid) ----------------- */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Start Date</Text>

            {/* Month Header with Prev/Next buttons */}
            <View style={styles.calendarMonthHeader}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.calNavBtn}>
                <Ionicons name="chevron-back" size={20} color="#154D38" />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {monthNames[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.calNavBtn}>
                <Ionicons name="chevron-forward" size={20} color="#154D38" />
              </TouchableOpacity>
            </View>

            {/* Day of Week Labels */}
            <View style={styles.weekLabelsRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <Text key={d} style={styles.weekLabel}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.calendarGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calendarDayCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = selectedCalendarDay === day;
                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellSelected,
                    ]}
                    onPress={() => setSelectedCalendarDay(day)}>
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDateModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmDatePicker}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------- REPEAT SELECTOR MODAL ----------------- */}
      <Modal
        visible={showRepeatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRepeatModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Repeat Frequency</Text>
            {(['Every Day', 'Weekdays', 'Custom'] as RepeatOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.repeatOptionRow,
                  frequency === opt && styles.repeatOptionRowSelected,
                ]}
                onPress={() => {
                  setFrequency(opt);
                  setShowRepeatModal(false);
                }}>
                <Text
                  style={[
                    styles.repeatOptionText,
                    frequency === opt && styles.repeatOptionTextSelected,
                  ]}>
                  {opt}
                </Text>
                {frequency === opt && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.modalCancelBtn, { marginTop: 16 }]}
              onPress={() => setShowRepeatModal(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
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
  medicationNameInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    paddingVertical: 2,
  },
  medicationDosageInput: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    paddingVertical: 2,
  },
  inlineErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  counterTextError: {
    color: '#DC2626',
    fontWeight: '700',
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
  itemCardError: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
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
    padding: 14,
    minHeight: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  instructionsInput: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 0,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EFE9',
    padding: 14,
    minHeight: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  noteInput: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    textAlignVertical: 'top',
    padding: 0,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 20,
  },
  deleteIcon: {
    marginRight: 6,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
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
  saveErrorsContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  saveErrorsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  saveErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  saveErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveErrorBoxText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
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
  saveButtonInvalid: {
    backgroundColor: '#4B6B5C',
    opacity: 0.85,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  /* Modals Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#154D38',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerColHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  pickerScroll: {
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: '#E6F4EE',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  pickerItemTextSelected: {
    color: '#10B981',
    fontWeight: '700',
  },
  periodColContainer: {
    width: '100%',
    justifyContent: 'center',
    paddingTop: 20,
  },
  periodItem: {
    marginVertical: 6,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Calendar Modal */
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  calNavBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  weekLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    width: 38,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  calendarDayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  calendarDayCellSelected: {
    backgroundColor: '#10B981',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Repeat Modal */
  repeatOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  repeatOptionRowSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  repeatOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  repeatOptionTextSelected: {
    color: '#10B981',
    fontWeight: '700',
  },
});
