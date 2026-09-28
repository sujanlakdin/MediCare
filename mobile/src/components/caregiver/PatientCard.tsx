import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';

interface PatientCardProps {
  patientName?: string;
  patientAge?: number;
  patientRole?: string;
  statusBadgeText?: string;
  avatarUri?: string;
  onPress?: () => void;
}

export function PatientCard({
  patientName = 'Eleanor Johnson',
  patientAge = 68,
  patientRole = 'Patient',
  statusBadgeText = 'MONITORING ACTIVE',
  avatarUri = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  onPress,
}: PatientCardProps) {
  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      <View style={styles.leftRow}>
        <Image source={{ uri: avatarUri }} style={styles.patientAvatar} />
        <View style={styles.infoCol}>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.patientSub}>
            Age {patientAge} • {patientRole}
          </Text>
        </View>
      </View>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{statusBadgeText}</Text>
      </View>
    </Pressable>
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
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundElement,
  },
  infoCol: {
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
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
});
