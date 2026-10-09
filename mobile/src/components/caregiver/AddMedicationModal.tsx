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
  patientId?: string;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialData,
  isEditMode = false,
  patientId,
}) => {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [dosage, setDosage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [frequency, setFrequency] = useState('Daily');
  const [form, setForm] = useState('Tablet');
  const [meal, setMeal] = useState('After food');
  const [stock, setStock] = useState('30');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  useEffect(() => {
    if (visible && isEditMode && initialData) {
      setName(initialData.name || '');
      setPurpose(initialData.purpose || '');
      setDosage(initialData.dosage || '1 tablet');
      setScheduledTime(initialData.scheduledTime || (initialData as any).times?.[0] || '08:00 AM');
      setFrequency(initialData.frequency || 'Daily');
      setForm(initialData.form || 'Tablet');
      setMeal(initialData.meal || 'After food');
      setStock(initialData.stock !== undefined ? String(initialData.stock) : '30');
      setInstructions(initialData.instructions || '');
    } else if (visible && !isEditMode) {
      setName('');
      setPurpose('');
      setDosage('1 tablet');
      setScheduledTime('08:00 AM');
      setFrequency('Daily');
      setForm('Tablet');
      setMeal('After food');
      setStock('30');
      setInstructions('');
    }
  }, [visible, isEditMode, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showAlert('Validation Error', 'Please enter the medication name.');
      return;
    }
    if (!scheduledTime.trim()) {
      showAlert('Validation Error', 'Please enter the scheduled time.');
      return;
    }

    const finalDosage = dosage.trim() || '1 tablet';
    const finalStock = parseInt(stock, 10) || 30;
    const targetId = initialData?._id || initialData?.id;

    try {
      setLoading(true);

      if (isEditMode && targetId) {
        await medicationApi.updateMedication(targetId, {
          name: name.trim(),
          purpose: purpose.trim(),
          dosage: finalDosage,
          scheduledTime: scheduledTime.trim(),
          frequency,
          form,
          meal,
          stock: finalStock,
          instructions: instructions.trim(),
        });
      } else {
        await medicationApi.addMedication({
          patientId,
          name: name.trim(),
          purpose: purpose.trim(),
          dosage: finalDosage,
          scheduledTime: scheduledTime.trim(),
          frequency,
          form,
          meal,
          stock: finalStock,
          instructions: instructions.trim() || 'Take with water after meals.',
        });
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      setLoading(false);
      showAlert('Error', error.message || `Failed to ${isEditMode ? 'update' : 'add'} medication`);
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

            {/* Purpose / Condition */}
            <Text style={styles.label}>Purpose / Condition</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Blood pressure, Diabetes, Cholesterol"
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
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

            {/* Form & Stock Row */}
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Form</Text>
                <View style={styles.frequencyRow}>
                  {['Tablet', 'Capsule', 'Syrup'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.freqChip,
                        form === item && styles.freqChipActive,
                      ]}
                      onPress={() => setForm(item)}>
                      <Text
                        style={[
                          styles.freqText,
                          form === item && styles.freqTextActive,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Stock (Pills Left)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 30"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                />
              </View>
            </View>

            {/* Meal Requirement */}
            <Text style={styles.label}>Meal Requirement</Text>
            <View style={styles.frequencyRow}>
              {['After food', 'Before food', 'With food', 'Empty stomach'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.freqChip,
                    meal === item && styles.freqChipActive,
                  ]}
                  onPress={() => setMeal(item)}>
                  <Text
                    style={[
                      styles.freqText,
                      meal === item && styles.freqTextActive,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Frequency */}
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyRow}>
              {[
                { label: 'Daily (1x)', val: 'Daily', time: '08:00 AM' },
                { label: 'Twice daily (2x)', val: 'Twice daily', time: '08:00 AM, 08:00 PM' },
                { label: '3 times daily (3x)', val: '3 times daily', time: '08:00 AM, 04:00 PM, 12:00 AM' },
                { label: 'Weekly', val: 'Weekly', time: '08:00 AM' },
                { label: 'As needed', val: 'As needed', time: 'As needed' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.val}
                  style={[
                    styles.freqChip,
                    frequency === item.val && styles.freqChipActive,
                  ]}
                  onPress={() => {
                    setFrequency(item.val);
                    if (!isEditMode) {
                      setScheduledTime(item.time);
                    }
                  }}>
                  <Text
                    style={[
                      styles.freqText,
                      frequency === item.val && styles.freqTextActive,
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 11, color: Colors.light.textSecondary, marginTop: 4 }}>
              * For multiple doses per day (e.g. 3 times daily 8-hr interval), enter times separated by commas.
            </Text>

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
