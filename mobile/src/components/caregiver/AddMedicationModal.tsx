import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { medicationApi, MedicationItem } from '@/services/api';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: MedicationItem | null;
  isEditMode?: boolean;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  isEditMode = false,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [frequency, setFrequency] = useState('Daily');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && isEditMode && initialData) {
      setName(initialData.name || '');
      setDosage(initialData.dosage || '');
      setScheduledTime(initialData.scheduledTime || '08:00 AM');
      setFrequency(initialData.frequency || 'Daily');
      setInstructions(initialData.instructions || '');
    } else if (visible && !isEditMode) {
      setName('');
      setDosage('');
      setScheduledTime('08:00 AM');
      setFrequency('Daily');
      setInstructions('');
    }
  }, [visible, isEditMode, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter the medication name.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Validation Error', 'Please enter the dosage (e.g. 500mg).');
      return;
    }
    if (!scheduledTime.trim()) {
      Alert.alert('Validation Error', 'Please enter the scheduled time.');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode && initialData?._id) {
        await medicationApi.updateMedication(initialData._id, {
          name: name.trim(),
          dosage: dosage.trim(),
          scheduledTime: scheduledTime.trim(),
          frequency,
          instructions: instructions.trim(),
        });
      } else {
        await medicationApi.addMedication({
          name: name.trim(),
          dosage: dosage.trim(),
          scheduledTime: scheduledTime.trim(),
          frequency,
          instructions: instructions.trim() || 'Take with water after meals.',
        });
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || `Failed to ${isEditMode ? 'update' : 'add'} medication`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={isEditMode ? 'create-outline' : 'medical-outline'}
                  size={20}
                  color={Colors.light.primary}
                />
              </View>
              <Text style={styles.title}>
                {isEditMode ? 'Edit Medication' : 'Add New Medication'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Med Name */}
            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lisinopril, Metformin"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Dosage & Time Row */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Dosage *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 10mg, 500mg"
                  placeholderTextColor="#94A3B8"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Schedule Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 08:00 AM"
                  placeholderTextColor="#94A3B8"
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                />
              </View>
            </View>

            {/* Frequency */}
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {['Daily', 'Twice daily', 'Weekly', 'As needed'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.freqChip,
                    frequency === item && styles.freqChipActive,
                  ]}
                  onPress={() => setFrequency(item)}>
                  <Text
                    style={[
                      styles.freqText,
                      frequency === item && styles.freqTextActive,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Instructions */}
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Take 1 tablet after meals with water."
              placeholderTextColor="#94A3B8"
              value={instructions}
              onChangeText={setInstructions}
              multiline={true}
              numberOfLines={3}
            />
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={isEditMode ? 'checkmark-circle-outline' : 'add-circle-outline'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.submitBtnText}>
                  {isEditMode ? 'Update Medication' : 'Save Medication'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  freqChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  freqChipActive: {
    backgroundColor: Colors.light.primary,
  },
  freqText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  freqTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
