import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { PatientItem, DEFAULT_PATIENTS } from '@/services/api';

interface PatientCardProps {
  patientName?: string;
  patientAge?: number;
  patientRole?: string;
  statusBadgeText?: string;
  avatarUri?: string;
  patientsList?: PatientItem[];
  selectedPatientId?: string;
  onSelectPatient?: (patient: PatientItem) => void;
  onPress?: () => void;
}

export function PatientCard({
  patientName = 'Eleanor Johnson',
  patientAge = 68,
  patientRole = 'Patient',
  statusBadgeText = 'MONITORING ACTIVE',
  avatarUri = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  patientsList = DEFAULT_PATIENTS,
  selectedPatientId,
  onSelectPatient,
  onPress,
}: PatientCardProps) {
  const effectivePatientsList = patientsList && patientsList.length > 0 ? patientsList : DEFAULT_PATIENTS;
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardPress = () => {
    setModalVisible(true);
  };

  return (
    <>
      <Pressable style={styles.cardContainer} onPress={handleCardPress}>
        <View style={styles.leftRow}>
          <Image source={{ uri: avatarUri }} style={styles.patientAvatar} />
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.patientName}>{patientName}</Text>
              <View style={styles.switchPill}>
                <Ionicons name="swap-horizontal" size={12} color={Colors.light.primary} />
                <Text style={styles.switchText}>Switch</Text>
              </View>
            </View>
            <Text style={styles.patientSub}>
              Age {patientAge} • {patientRole}
            </Text>
          </View>
        </View>

        <View style={styles.badgeContainer}>
          <Text
            style={[
              styles.badgeText,
              statusBadgeText.includes('ATTENTION') && styles.attentionBadgeText,
            ]}>
            {statusBadgeText}
          </Text>
        </View>
      </Pressable>

      {/* Patient Switcher Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Switch active patient to view their medication schedule and vitals.
            </Text>

            <FlatList
              data={effectivePatientsList}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
              renderItem={({ item }) => {
                const isSelected = item._id === selectedPatientId || item.name === patientName;
                return (
                  <TouchableOpacity
                    style={[styles.patientOption, isSelected && styles.patientOptionSelected]}
                    onPress={() => {
                      if (onSelectPatient) {
                        onSelectPatient(item);
                      }
                      setModalVisible(false);
                    }}>
                    <View style={styles.patientOptionLeft}>
                      <View style={styles.optionAvatarContainer}>
                        <Ionicons
                          name="person-circle-outline"
                          size={36}
                          color={isSelected ? Colors.light.primary : Colors.light.textSecondary}
                        />
                      </View>
                      <View>
                        <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                          {item.name}
                        </Text>
                        <Text style={styles.optionSub}>
                          Age {item.age} • Phone: {item.phone || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 14,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundElement,
  },
  infoCol: {
    justifyContent: 'center',
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F2EC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  patientSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: '#E6F4EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.4,
  },
  attentionBadgeText: {
    color: Colors.light.alert,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  patientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientOptionSelected: {
    backgroundColor: '#E8F2EC',
    borderColor: Colors.light.primary,
  },
  patientOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  optionNameSelected: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
