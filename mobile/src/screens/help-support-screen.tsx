import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CareIcon } from '@/components/care-icon';
import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiError, apiRequest } from '@/services/api';

export default function HelpSupportScreen() {
  const { token } = useAuth();
  const { settings: a11y } = useAccessibility();

  // Support Request Modal State
  const [modalMode, setModalMode] = useState<'support' | 'report' | 'pharmacist' | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  function handleCall119() {
    Alert.alert(
      'Emergency Ambulance',
      'Connecting to National Emergency Ambulance Service (119)...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 119',
          style: 'destructive',
          onPress: () => {
            void Linking.openURL('tel:119').catch(() => undefined);
          },
        },
      ]
    );
  }

  async function submitSupport() {
    if (!token) {
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setModalMode(null);
      }, 1500);
      return;
    }

    if (subject.trim().length < 3 || description.trim().length < 5) {
      setError('Please provide a subject and brief description.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await apiRequest('/api/support', {
        method: 'POST',
        token,
        body: { subject: subject.trim(), description: description.trim() },
      });
      setSentSuccess(true);
      setSubject('');
      setDescription('');
      setTimeout(() => {
        setSentSuccess(false);
        setModalMode(null);
      }, 1800);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to send request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen
      title="Help & Support"
      subtitle="Get assistance, FAQs and medical guidance"
      showBack={true}
      patientTab="settings"
      hideBottomNav={false}>
      <View style={styles.container}>
        {/* Top 2 Quick Action Cards (Side-by-Side) */}
        <View style={styles.quickGrid}>
          {/* Card 1: Talk to Pharmacist */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Talk to Pharmacist. Ask about medications & side-effects"
            onPress={() => setModalMode('pharmacist')}
            style={({ pressed }) => [
              styles.quickCard,
              a11y.largerButtons && styles.largeQuickCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.quickIconCircle}>
              <CareIcon name="pharmacist" size={20} color="#22996E" />
            </View>
            <Text style={styles.quickTitle}>Talk to Pharmacist</Text>
            <Text style={styles.quickSubtitle}>Ask about medications & side-effects</Text>
          </Pressable>

          {/* Card 2: App Guides */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="App Guides. Learn how to use CareRx tracker"
            onPress={() => router.push('/settings/faq' as Href)}
            style={({ pressed }) => [
              styles.quickCard,
              a11y.largerButtons && styles.largeQuickCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.quickIconCircle}>
              <CareIcon name="guide" size={20} color="#22996E" />
            </View>
            <Text style={styles.quickTitle}>App Guides</Text>
            <Text style={styles.quickSubtitle}>Learn how to use CareRx tracker</Text>
          </Pressable>
        </View>

        {/* Options List Card */}
        <View style={styles.menuCard}>
          {/* Contact Support */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Contact CareRx Support"
            onPress={() => {
              setSubject('Support Request');
              setDescription('');
              setModalMode('support');
            }}
            style={({ pressed }) => [
              styles.menuRow,
              a11y.largerButtons && styles.largeMenuRow,
              pressed && styles.pressed,
            ]}>
            <View style={styles.rowIconCircle}>
              <CareIcon name="chat" size={18} color="#22996E" />
            </View>
            <Text style={styles.menuRowTitle}>Contact CareRx Support</Text>
            <CareIcon name="chevron-right" size={18} color="#9CB0A6" />
          </Pressable>

          <View style={styles.divider} />

          {/* Report a Problem */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report a Problem"
            onPress={() => {
              setSubject('Bug Report');
              setDescription('');
              setModalMode('report');
            }}
            style={({ pressed }) => [
              styles.menuRow,
              a11y.largerButtons && styles.largeMenuRow,
              pressed && styles.pressed,
            ]}>
            <View style={styles.rowIconCircle}>
              <CareIcon name="alert-triangle" size={18} color="#22996E" />
            </View>
            <Text style={styles.menuRowTitle}>Report a Problem</Text>
            <CareIcon name="chevron-right" size={18} color="#9CB0A6" />
          </Pressable>

          <View style={styles.divider} />

          {/* Browse All FAQs */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Browse All FAQs"
            onPress={() => router.push('/settings/faq' as Href)}
            style={({ pressed }) => [
              styles.menuRow,
              a11y.largerButtons && styles.largeMenuRow,
              pressed && styles.pressed,
            ]}>
            <View style={styles.rowIconCircle}>
              <CareIcon name="help" size={18} color="#22996E" />
            </View>
            <Text style={styles.menuRowTitle}>Browse All FAQs</Text>
            <CareIcon name="chevron-right" size={18} color="#9CB0A6" />
          </Pressable>
        </View>

        {/* Emergency Medical Help Warning Card */}
        <View style={styles.emergencyCard}>
          <Text style={styles.emergencyTitle}>EMERGENCY MEDICAL HELP</Text>
          <Text style={styles.emergencyDescription}>
            If you have a medical emergency, do not wait for a caregiver. Press
            below to call ambulance.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call Medical Services 119"
            onPress={handleCall119}
            style={({ pressed }) => [
              styles.emergencyRedButton,
              a11y.largerButtons && styles.largeEmergencyBtn,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.emergencyRedButtonText}>
              Call Medical Services (119)
            </Text>
          </Pressable>
        </View>

        {/* Support / Contact Modal */}
        <Modal
          visible={modalMode !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalMode(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalMode === 'pharmacist'
                    ? 'Talk to Pharmacist'
                    : modalMode === 'report'
                    ? 'Report a Problem'
                    : 'CareRx Support'}
                </Text>
                <Pressable onPress={() => setModalMode(null)}>
                  <Text style={styles.closeX}>✕</Text>
                </Pressable>
              </View>

              {modalMode === 'pharmacist' ? (
                <View style={styles.pharmacistBox}>
                  <Text style={styles.pharmacistNote}>
                    Our licensed on-duty pharmacists are available 24/7 to answer
                    dosage, interaction, and side-effect queries.
                  </Text>
                  <Pressable
                    onPress={() => {
                      void Linking.openURL('tel:1990').catch(() => undefined);
                    }}
                    style={styles.hotlineBtn}>
                    <Text style={styles.hotlineBtnText}>📞 Call 1990 Health Hotline</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.formCol}>
                  {sentSuccess ? (
                    <Text style={styles.successMsg}>✓ Request sent successfully!</Text>
                  ) : null}
                  <Text style={styles.modalLabel}>Subject</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Brief summary..."
                  />
                  <Text style={styles.modalLabel}>Description</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Details about your inquiry..."
                    multiline
                    numberOfLines={4}
                  />
                  {error ? <Text style={styles.modalError}>{error}</Text> : null}
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => void submitSupport()}
                    style={styles.submitBtn}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Submit Request</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  largeQuickCard: {
    paddingVertical: 20,
  },
  quickIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E3E2F',
  },
  quickSubtitle: {
    fontSize: 12,
    color: '#71827A',
    lineHeight: 16,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  largeMenuRow: {
    paddingVertical: 18,
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
    marginLeft: 60,
  },
  emergencyCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FACDCD',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D32F2F',
    letterSpacing: 0.5,
  },
  emergencyDescription: {
    fontSize: 13,
    color: '#8A2727',
    lineHeight: 18,
  },
  emergencyRedButton: {
    height: 50,
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    elevation: 2,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  largeEmergencyBtn: {
    height: 60,
  },
  emergencyRedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 440,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E3E2F',
  },
  closeX: {
    fontSize: 20,
    color: '#71827A',
    padding: 4,
  },
  pharmacistBox: {
    gap: 14,
    paddingVertical: 10,
  },
  pharmacistNote: {
    fontSize: 14,
    color: '#4A6054',
    lineHeight: 20,
  },
  hotlineBtn: {
    height: 48,
    backgroundColor: '#22996E',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  formCol: {
    gap: 10,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A6054',
  },
  modalInput: {
    height: 44,
    backgroundColor: '#F9FBFA',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1C2A24',
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modalError: {
    color: '#D32F2F',
    fontSize: 12,
  },
  successMsg: {
    color: '#1B7D54',
    fontWeight: '700',
    fontSize: 14,
  },
  submitBtn: {
    height: 46,
    backgroundColor: '#0E3E2F',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});