import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { AddMedicationModal } from './AddMedicationModal';
import { medicationApi, MedicationItem } from '@/services/api';

const defaultMedicationsList: MedicationItem[] = [
  {
    _id: '1',
    name: 'Lisinopril 10mg',
    dosage: '10mg',
    scheduledTime: '8:00 AM',
    instructions: 'Take 1 tablet in the morning with food',
    status: 'taken',
  },
  {
    _id: '2',
    name: 'Atorvastatin 20mg',
    dosage: '20mg',
    scheduledTime: '8:00 AM',
    instructions: 'Take 1 tablet at breakfast',
    status: 'taken',
  },
  {
    _id: '3',
    name: 'Metformin 500mg',
    dosage: '500mg',
    scheduledTime: '12:30 PM & 6:00 PM',
    instructions: 'Take 1 tablet after meals with water',
    status: 'missed',
  },
  {
    _id: '4',
    name: 'Amlodipine 5mg',
    dosage: '5mg',
    scheduledTime: '9:00 PM',
    instructions: 'Take 1 tablet before bedtime',
    status: 'upcoming',
  },
];

interface MedicationListProps {
  onAddMedication?: () => void;
  onEditSchedule?: (med: MedicationItem) => void;
}

export const MedicationList: React.FC<MedicationListProps> = () => {
  const [medications, setMedications] = useState<MedicationItem[]>(defaultMedicationsList);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicationItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchMeds = async () => {
    setLoading(true);
    const data = await medicationApi.getMedications();
    if (data && data.length > 0) {
      setMedications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleOpenAdd = () => {
    setSelectedMed(null);
    setIsEditMode(false);
    setModalVisible(true);
  };

  const handleOpenEdit = (med: MedicationItem) => {
    setSelectedMed(med);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const performDelete = async (med: MedicationItem) => {
    // Optimistic UI removal
    setMedications((prev) => prev.filter((item) => item._id !== med._id));

    if (med._id && med._id.length > 5) {
      try {
        await medicationApi.deleteMedication(med._id);
      } catch (error: any) {
        console.warn('Backend delete failed, fallback to local removal');
      }
    }
  };

  const handleDelete = (med: MedicationItem) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${med.name}"?`);
      if (confirmed) {
        performDelete(med);
      }
    } else {
      Alert.alert(
        'Delete Medication',
        `Are you sure you want to remove "${med.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => performDelete(med),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Active Medications</Text>
          <Text style={styles.subTitle}>Total {medications.length} prescribed</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Medication</Text>
        </TouchableOpacity>
      </View>

      {/* Medication Items */}
      {loading ? (
        <ActivityIndicator color={Colors.light.primary} style={{ marginVertical: 20 }} />
      ) : (
        medications.map((med, index) => (
          <View key={med._id || index} style={styles.medCard}>
            <View style={styles.medHeaderRow}>
              <View style={styles.iconTitleRow}>
                <View style={styles.pillIconCircle}>
                  <Ionicons name="bandage-outline" size={18} color={Colors.light.primary} />
                </View>
                <View>
                  <Text style={styles.medName}>
                    {med.name} {med.dosage && !med.name.includes(med.dosage) ? med.dosage : ''}
                  </Text>
                  <Text style={styles.timeLabel}>
                    <Ionicons name="time-outline" size={12} color={Colors.light.textSecondary} />{' '}
                    {med.scheduledTime}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Edit & Delete */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(med)}>
                  <Ionicons name="create-outline" size={14} color={Colors.light.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(med)}>
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            {med.instructions ? (
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>{med.instructions}</Text>
              </View>
            ) : null}
          </View>
        ))
      )}

      {/* Add / Edit Medication Modal */}
      <AddMedicationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchMeds}
        initialData={selectedMed}
        isEditMode={isEditMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  subTitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  medCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 10,
  },
  medHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pillIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  instructionText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
});
