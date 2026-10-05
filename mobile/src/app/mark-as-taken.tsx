import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Tabs, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MaxContentWidth } from '@/constants/theme';

const AVAILABLE_SIDE_EFFECTS = ['Nausea', 'Dizziness', 'Headache'];

export default function MarkAsTakenScreen() {
  const router = useRouter();

  // Local state for note and selectable side-effect chips
  const [note, setNote] = useState<string>('');
  // Mock design initially has "Nausea" selected
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>(['Nausea']);

  const toggleSideEffect = (effect: string) => {
    setSelectedSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((item) => item !== effect) : [...prev, effect]
    );
  };

  const handleDone = () => {
    // Navigate back to medication schedule as requested
    router.push('/medication-schedule' as any);
  };

  const handleUndo = () => {
    Alert.alert(
      'Undo Dose Logging',
      'Are you sure you want to undo marking this dose as taken?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Hide default header title & tabs */}
      <Tabs.Screen options={{ tabBarStyle: { display: 'none' }, headerShown: false, title: '' }} />
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      {/* Screen Header matching design */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mark as Taken</Text>

        {/* Empty placeholder to balance back button and center title */}
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexOne}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.wrapper}>
            {/* Taken Successfully Green Banner */}
            <View style={styles.successBanner}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Taken Successfully</Text>
                <Text style={styles.bannerSubtitle}>Logged at 8:12 AM</Text>
              </View>
            </View>

            {/* Medication Details Card */}
            <View style={styles.medCard}>
              {/* Top row: Pill icon + Medication name + Dosage/form */}
              <View style={styles.medCardHeader}>
                <View style={styles.pillIconContainer}>
                  <MaterialCommunityIcons
                    name="pill"
                    size={24}
                    color="#10B981"
                    style={styles.pillIcon}
                  />
                </View>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>Lisinopril</Text>
                  <Text style={styles.medDosage}>10 mg • Tablet</Text>
                </View>
              </View>

              {/* Subtle divider */}
              <View style={styles.cardDivider} />

              {/* Bottom row: Scheduled time + Dose */}
              <View style={styles.medCardFooter}>
                <View>
                  <Text style={styles.footerLabel}>SCHEDULED</Text>
                  <Text style={styles.footerValue}>08:00 AM</Text>
                </View>
                <View style={styles.doseContainer}>
                  <Text style={[styles.footerLabel, styles.alignRight]}>DOSE</Text>
                  <Text style={[styles.footerValue, styles.alignRight]}>1 Tablet</Text>
                </View>
              </View>
            </View>

            {/* Notes & Side Effects Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Notes & Side Effects</Text>

              {/* Note Input */}
              <View style={styles.noteInputWrapper}>
                <Ionicons name="pencil-outline" size={18} color="#64748B" style={styles.noteIcon} />
                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note (optional)"
                  placeholderTextColor="#94A3B8"
                  value={note}
                  onChangeText={setNote}
                  returnKeyType="done"
                />
              </View>

              {/* Selectable Side Effect Chips */}
              <View style={styles.chipsRow}>
                {AVAILABLE_SIDE_EFFECTS.map((effect) => {
                  const isSelected = selectedSideEffects.includes(effect);
                  return (
                    <TouchableOpacity
                      key={effect}
                      style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                      onPress={() => toggleSideEffect(effect)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Toggle side effect ${effect}`}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}>
                        {effect}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions Container */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBarContainer}>
          <View style={styles.bottomBarWrapper}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              activeOpacity={0.85}
              accessibilityLabel="Done"
              accessibilityRole="button">
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.undoButton}
              onPress={handleUndo}
              activeOpacity={0.7}
              accessibilityLabel="Undo Action"
              accessibilityRole="button">
              <Text style={styles.undoButtonText}>Undo Action</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flexOne: {
    flex: 1,
    backgroundColor: '#F8FAF9',
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
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D8F3E5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#335C49',
  },
  medCard: {
    backgroundColor: '#EDF5F1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  medCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCEEE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pillIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  medDosage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#D5E5DC',
    marginVertical: 16,
  },
  medCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  doseContainer: {
    alignItems: 'flex-end',
  },
  alignRight: {
    textAlign: 'right',
  },
  sectionContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  noteInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 8,
    marginBottom: 14,
  },
  noteIcon: {
    marginRight: 10,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#E6F4EE',
    borderWidth: 1.2,
    borderColor: '#10B981',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#059669',
    fontWeight: '600',
  },
  chipTextUnselected: {
    color: '#64748B',
    fontWeight: '500',
  },
  bottomBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  bottomBarWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  doneButton: {
    backgroundColor: '#065F46',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  undoButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
