import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export interface Medication {
  id: string;
  name: string;
  category: string;
  frequency: string;
  prescriber: string;
  refillDate: string;
  isRefillUrgent?: boolean;
}

const DEFAULT_MEDS: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril 10mg',
    category: 'Blood Pressure',
    frequency: 'Once daily, Morning 8:00 AM',
    prescriber: 'Dr. Patel',
    refillDate: 'Oct 5',
  },
  {
    id: '2',
    name: 'Atorvastatin 20mg',
    category: 'Cholesterol',
    frequency: 'Once daily, Morning 8:00 AM',
    prescriber: 'Dr. Patel',
    refillDate: 'Oct 12',
  },
  {
    id: '3',
    name: 'Metformin 500mg',
    category: 'Diabetes',
    frequency: 'Twice daily, 12:30 PM & 6:00 PM',
    prescriber: 'Dr. Patel',
    refillDate: 'Sept 28 *',
    isRefillUrgent: true,
  },
  {
    id: '4',
    name: 'Amlodipine 5mg',
    category: 'Blood Pressure',
    frequency: 'Once daily, Evening 9:00 PM',
    prescriber: 'Dr. Patel',
    refillDate: 'Nov 1',
  },
];

interface MedicationListProps {
  medications?: Medication[];
  onAddMedication?: () => void;
  onEditSchedule?: (med: Medication) => void;
}

export function MedicationList({
  medications = DEFAULT_MEDS,
  onAddMedication,
  onEditSchedule,
}: MedicationListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Medication List</Text>
      <Text style={styles.sectionSub}>Eleanor Johnson's Medications</Text>

      <View style={styles.listGap}>
        {medications.map((med) => (
          <View
            key={med.id}
            style={[
              styles.medCard,
              med.isRefillUrgent && styles.urgentCard,
            ]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <View style={styles.pillIconBg}>
                  <Ionicons name="medical-outline" size={16} color={Colors.light.primary} />
                </View>
                <View>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medCategory}>{med.category}</Text>
                </View>
              </View>
              <Pressable
                style={styles.editBtn}
                onPress={() => onEditSchedule && onEditSchedule(med)}>
                <Text style={styles.editBtnText}>Edit Schedule</Text>
              </Pressable>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.freqText}>{med.frequency}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.prescriberText}>Prescriber: {med.prescriber}</Text>
                <Text
                  style={[
                    styles.refillText,
                    med.isRefillUrgent && styles.urgentRefillText,
                  ]}>
                  Refill: {med.refillDate}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.addBtn} onPress={onAddMedication}>
        <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.addBtnText}>Add Medication</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sectionSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 14,
  },
  listGap: {
    gap: 12,
    marginBottom: 16,
  },
  medCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  urgentCard: {
    borderColor: Colors.light.alertBorder,
    backgroundColor: '#FFFDFD',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pillIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  medCategory: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 4,
  },
  freqText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  prescriberText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  refillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  urgentRefillText: {
    color: Colors.light.alert,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
