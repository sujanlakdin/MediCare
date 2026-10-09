import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface EmergencyModalProps {
  visible: boolean;
  onClose: () => void;
  patientName?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  visible,
  onClose,
  patientName = 'Selected Patient',
}) => {
  const handleDial = (phoneNumber: string, label: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert(`Calling ${label}`, `Dialing ${phoneNumber}...`);
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.alertIconBadge}>
                <Ionicons name="warning" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Emergency Hotlines</Text>
                <Text style={styles.headerSub}>Sri Lanka Medical & Safety Services</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* Active Patient Card */}
            <View style={styles.patientBanner}>
              <View style={styles.patientBannerLeft}>
                <Text style={styles.patientBannerLabel}>ACTIVE PATIENT CONTEXT</Text>
                <Text style={styles.patientName}>{patientName}</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>CARE RECIPIENT</Text>
              </View>
            </View>

            {/* Sri Lanka Official Emergency Hotlines */}
            <Text style={styles.sectionHeader}>🚨 EMERGENCY & AMBULANCE HOTLINES</Text>
            <View style={styles.hotlineGrid}>
              {/* Suwa Seriya Ambulance */}
              <Pressable
                style={[styles.hotlineCard, styles.suwaSeriyaCard]}
                onPress={() => handleDial('1990', 'Suwa Seriya Ambulance')}>
                <View style={styles.hotlineIconWrapRed}>
                  <Ionicons name="call" size={20} color="#DC2626" />
                </View>
                <View style={styles.hotlineInfo}>
                  <Text style={styles.hotlineTitleBold}>Suwa Seriya Ambulance Service</Text>
                  <Text style={styles.hotlineSub}>1990 • Toll-free 24/7 Island-wide Emergency Care</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#DC2626" />
              </Pressable>

              {/* Police Emergency */}
              <Pressable
                style={styles.hotlineCard}
                onPress={() => handleDial('119', 'Police Emergency Service')}>
                <View style={styles.hotlineIconWrapBlue}>
                  <Ionicons name="shield-checkmark" size={20} color="#1E3A8A" />
                </View>
                <View style={styles.hotlineInfo}>
                  <Text style={styles.hotlineTitle}>Police Emergency Service</Text>
                  <Text style={styles.hotlineSub}>119 • Immediate Safety Response</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>

              {/* National Hospital Accident Service */}
              <Pressable
                style={styles.hotlineCard}
                onPress={() => handleDial('0112691111', 'National Hospital Accident Service')}>
                <View style={styles.hotlineIconWrapSky}>
                  <Ionicons name="medkit" size={20} color="#0284C7" />
                </View>
                <View style={styles.hotlineInfo}>
                  <Text style={styles.hotlineTitle}>National Hospital Accident Service</Text>
                  <Text style={styles.hotlineSub}>011-2691111 • Acute Medical Care (Colombo)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>

              {/* National Mental Health Helpline */}
              <Pressable
                style={styles.hotlineCard}
                onPress={() => handleDial('1926', 'National Mental Health Helpline')}>
                <View style={styles.hotlineIconWrapAmber}>
                  <Ionicons name="heart" size={20} color="#D97706" />
                </View>
                <View style={styles.hotlineInfo}>
                  <Text style={styles.hotlineTitle}>National Mental Health Helpline</Text>
                  <Text style={styles.hotlineSub}>1926 • 24/7 Mental Health Helpline</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>

              {/* Primary Care Physician */}
              <Pressable
                style={styles.hotlineCard}
                onPress={() => handleDial('0701982984', 'Primary Care Doctor')}>
                <View style={styles.hotlineIconWrapTeal}>
                  <Ionicons name="medical" size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.hotlineInfo}>
                  <Text style={styles.hotlineTitle}>Primary Care Doctor</Text>
                  <Text style={styles.hotlineSub}>070 198 2984 (Primary Physician)</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#64748B" />
              </Pressable>
            </View>
          </ScrollView>

          {/* Quick Call Action */}
          <View style={styles.footer}>
            <Pressable
              style={styles.actionCallBtn}
              onPress={() => handleDial('1990', 'Suwa Seriya Ambulance (1990)')}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.actionCallText}>CALL SUWA SERIYA (1990)</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  patientBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientBannerLeft: {
    flex: 1,
  },
  patientBannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  hotlineGrid: {
    gap: 10,
    marginBottom: 8,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  suwaSeriyaCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  hotlineIconWrapRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineIconWrapBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineIconWrapSky: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineIconWrapAmber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineIconWrapTeal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineTitleBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
  },
  hotlineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  hotlineSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionCallBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionCallText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
