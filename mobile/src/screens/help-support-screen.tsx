import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen, ScreenSection } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { submitSupport } from '@/services/medicare-api';

export default function HelpSupportScreen() {
  const { token, user } = useAuth();
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  // Modals state
  const [showPharmacistModal, setShowPharmacistModal] = useState(false);
  const [showGuidesModal, setShowGuidesModal] = useState(false);
  const [showCaregiverSupportModal, setShowCaregiverSupportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Report a problem form state
  const [reportSubject, setReportSubject] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  async function handleSendReport() {
    if (!token) return;
    if (reportSubject.trim().length < 3) {
      setReportError('Please enter a subject (at least 3 characters).');
      return;
    }
    if (reportDescription.trim().length < 10) {
      setReportError('Please enter a description (at least 10 characters).');
      return;
    }

    setIsSubmittingReport(true);
    setReportError('');

    try {
      await submitSupport(token, {
        subject: reportSubject.trim(),
        description: reportDescription.trim(),
      });
      setReportSuccess(true);
      setReportSubject('');
      setReportDescription('');
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
      }, 2000);
    } catch (requestError) {
      setReportError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to submit report. Please check your connection.'
      );
    } finally {
      setIsSubmittingReport(false);
    }
  }

  function handleCallEmergency() {
    Alert.alert(
      'Emergency Call (119)',
      'Do you want to dial Emergency Medical Services (119) now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 119',
          style: 'destructive',
          onPress: () => {
            void Linking.openURL('tel:119').catch(() => {
              Alert.alert('Unable to place call', 'Please dial 119 directly on your phone.');
            });
          },
        },
      ]
    );
  }

  function handleCallPharmacist() {
    Alert.alert(
      'Pharmacist Helpline',
      'Connect to MediCare 24/7 Pharmacy Support line (1-800-MED-CARE)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            void Linking.openURL('tel:18006332273').catch(() => {
              Alert.alert('Helpline Number', '1-800-MED-CARE (1-800-633-2273)');
            });
          },
        },
      ]
    );
  }

  return (
    <Screen
      title="Help & Support"
      subtitle="Get help with your MediCare app"
      simpleSubtitle="Get help and guides">
      {/* Options List */}
      <View style={styles.optionsList}>
        <SupportOptionItem
          title="Talk to Pharmacist"
          subtitle="Consult on medication dosage, interactions & advice"
          icon={{ ios: 'cross.case.fill', android: 'local_pharmacy', web: 'local_pharmacy' }}
          onPress={() => setShowPharmacistModal(true)}
        />

        <SupportOptionItem
          title="App Guides"
          subtitle="Step-by-step visual instructions for patients"
          icon={{ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }}
          onPress={() => setShowGuidesModal(true)}
        />

        <SupportOptionItem
          title="Contact Caregiver Support"
          subtitle="Help with linking family members & alert sync"
          icon={{ ios: 'person.2.fill', android: 'support_agent', web: 'support_agent' }}
          onPress={() => setShowCaregiverSupportModal(true)}
        />

        <SupportOptionItem
          title="Report a Problem"
          subtitle="Send questions, bug reports or feedback to support"
          icon={{ ios: 'exclamationmark.bubble.fill', android: 'feedback', web: 'feedback' }}
          onPress={() => setShowReportModal(true)}
        />

        <SupportOptionItem
          title="Browse All FAQs"
          subtitle="Instant answers to frequently asked questions"
          icon={{ ios: 'questionmark.circle.fill', android: 'quiz', web: 'quiz' }}
          onPress={() => router.push('/settings/faq' as Href)}
        />
      </View>

      {/* Emergency Medical Help Section */}
      <ScreenSection title="Emergency Medical Help">
        <ThemedView type="backgroundElement" style={styles.emergencyCard}>
          <View style={styles.emergencyCardHeader}>
            <View style={styles.emergencyIconContainer}>
              <SymbolView
                name={{ ios: 'cross.fill', android: 'emergency', web: 'emergency' }}
                size={26}
                tintColor="#dc2626"
              />
            </View>
            <View style={styles.emergencyCardText}>
              <ThemedText type="smallBold" style={styles.emergencyTitle}>
                Urgent Medical Situation
              </ThemedText>
              <ThemedText type="small" style={styles.emergencyDesc}>
                If you are experiencing severe symptoms, dial emergency medical services immediately.
              </ThemedText>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call Medical Services 119"
            accessibilityHint="Double tap to confirm emergency call"
            onPress={handleCallEmergency}
            style={({ pressed }) => [
              styles.emergencyCallBtn,
              a11y.largerButtons && styles.largeEmergencyBtn,
              pressed && styles.btnPressed,
            ]}>
            <SymbolView
              name={{ ios: 'phone.circle.fill', android: 'call', web: 'call' }}
              size={24}
              tintColor="#ffffff"
            />
            <ThemedText style={styles.emergencyCallBtnText}>
              Call Medical Services (119)
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScreenSection>

      {/* Talk to Pharmacist Modal */}
      <Modal
        visible={showPharmacistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPharmacistModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Talk to Pharmacist
              </ThemedText>
              <Pressable onPress={() => setShowPharmacistModal(false)} style={styles.closeBtn}>
                <ThemedText style={styles.closeBtnText}>✕</ThemedText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <ThemedText style={styles.modalBodyText}>
                Our licensed pharmacy partners are available 24/7 to answer questions about dosage instructions, medication side-effects, food interactions, and prescription refills.
              </ThemedText>
              <ThemedView type="backgroundElement" style={styles.guideCard}>
                <ThemedText type="smallBold">Hotline: 1-800-MED-CARE</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Available in English and Sinhala · Free from mobile networks
                </ThemedText>
              </ThemedView>
            </ScrollView>
            <ActionButton label="Call Pharmacist Hotline" onPress={handleCallPharmacist} />
            <ActionButton label="Close" secondary onPress={() => setShowPharmacistModal(false)} />
          </ThemedView>
        </View>
      </Modal>

      {/* App Guides Modal */}
      <Modal
        visible={showGuidesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGuidesModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                App Guides
              </ThemedText>
              <Pressable onPress={() => setShowGuidesModal(false)} style={styles.closeBtn}>
                <ThemedText style={styles.closeBtnText}>✕</ThemedText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <GuideStep
                number="1"
                title="Taking Scheduled Medications"
                description="When your reminder chimes, tap the notification or open MediCare to confirm your dose was taken."
              />
              <GuideStep
                number="2"
                title="Configuring Reminders"
                description="Go to Settings > Notification Settings to customize Morning, Noon, and Evening reminder intervals."
              />
              <GuideStep
                number="3"
                title="Linking a Family Caregiver"
                description="Go to Emergency & Caregiver > Add Caregiver to ensure your loved ones receive SMS alerts if doses are missed."
              />
              <GuideStep
                number="4"
                title="Adjusting Text & Display"
                description="Go to Settings > Accessibility to enlarge text and enable High Contrast for effortless reading."
              />
            </ScrollView>
            <ActionButton label="Close Guides" onPress={() => setShowGuidesModal(false)} />
          </ThemedView>
        </View>
      </Modal>

      {/* Contact Caregiver Support Modal */}
      <Modal
        visible={showCaregiverSupportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCaregiverSupportModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Caregiver Support
              </ThemedText>
              <Pressable onPress={() => setShowCaregiverSupportModal(false)} style={styles.closeBtn}>
                <ThemedText style={styles.closeBtnText}>✕</ThemedText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <ThemedText style={styles.modalBodyText}>
                Need help inviting a daughter, son, neighbor or visiting nurse to your MediCare profile?
              </ThemedText>
              <ThemedView type="backgroundElement" style={styles.guideCard}>
                <ThemedText type="smallBold">Caregiver Support Desk</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Email: caregivers@medicare-care.org
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Support line: (011) 234-5678 (Mon–Sat 8:00 AM – 6:00 PM)
                </ThemedText>
              </ThemedView>
            </ScrollView>
            <ActionButton
              label="Go to Emergency & Caregiver"
              onPress={() => {
                setShowCaregiverSupportModal(false);
                router.push('/settings/caregivers' as Href);
              }}
            />
            <ActionButton label="Close" secondary onPress={() => setShowCaregiverSupportModal(false)} />
          </ThemedView>
        </View>
      </Modal>

      {/* Report a Problem Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReportModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Report a Problem
              </ThemedText>
              <Pressable onPress={() => setShowReportModal(false)} style={styles.closeBtn}>
                <ThemedText style={styles.closeBtnText}>✕</ThemedText>
              </Pressable>
            </View>

            {reportSuccess ? (
              <View style={styles.successBanner} accessibilityRole="alert">
                <ThemedText style={styles.successText}>
                  ✓ Support request submitted! Our team will contact you.
                </ThemedText>
              </View>
            ) : null}

            {reportError ? (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <ThemedText style={styles.errorBannerText}>{reportError}</ThemedText>
              </View>
            ) : null}

            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <ThemedText type="small" themeColor="textSecondary">
                Submitting as {user?.fullName || 'patient'} ({user?.email || 'authenticated account'})
              </ThemedText>

              <FormField
                label="SUBJECT"
                value={reportSubject}
                onChangeText={setReportSubject}
                placeholder="e.g. Reminder sound did not ring"
              />

              <FormField
                label="DESCRIPTION"
                value={reportDescription}
                onChangeText={setReportDescription}
                placeholder="Explain what happened in detail..."
                multiline
                numberOfLines={4}
                style={styles.descriptionInput}
              />
            </ScrollView>

            <ActionButton
              label={isSubmittingReport ? 'Submitting...' : 'Submit Support Request'}
              loading={isSubmittingReport}
              onPress={() => void handleSendReport()}
            />
            <ActionButton
              label="Cancel"
              secondary
              disabled={isSubmittingReport}
              onPress={() => setShowReportModal(false)}
            />
          </ThemedView>
        </View>
      </Modal>
    </Screen>
  );
}

function SupportOptionItem({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: { ios?: any; android?: string; web?: string };
  onPress: () => void;
}) {
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <ThemedView
        type="backgroundElement"
        style={[styles.row, a11y.largerButtons && styles.largeRow]}>
        <View style={styles.iconContainer}>
          <SymbolView name={icon} size={24} tintColor="#145c44" />
        </View>

        <View style={styles.copy}>
          <ThemedText type="smallBold" style={styles.itemTitle}>
            {title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.itemSubtitle}>
            {subtitle}
          </ThemedText>
        </View>

        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={20}
          tintColor={theme.textSecondary}
        />
      </ThemedView>
    </Pressable>
  );
}

function GuideStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.guideStepCard}>
      <View style={styles.guideStepNumber}>
        <ThemedText style={styles.guideStepNumberText}>{number}</ThemedText>
      </View>
      <View style={styles.guideStepInfo}>
        <ThemedText type="smallBold" style={styles.guideStepTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.guideStepDesc}>
          {description}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: Spacing.two,
  },
  pressable: {
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  row: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  largeRow: {
    minHeight: 88,
    paddingVertical: Spacing.four,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  itemSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  emergencyCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  emergencyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyCardText: {
    flex: 1,
    gap: 2,
  },
  emergencyTitle: {
    fontSize: 17,
    color: '#991b1b',
  },
  emergencyDesc: {
    color: '#7f1d1d',
    lineHeight: 18,
  },
  emergencyCallBtn: {
    minHeight: 54,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    elevation: 2,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  largeEmergencyBtn: {
    minHeight: 66,
  },
  btnPressed: {
    opacity: 0.8,
  },
  emergencyCallBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    maxHeight: '85%',
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  closeBtn: {
    padding: Spacing.two,
  },
  closeBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6b7280',
  },
  modalScroll: {
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  modalBodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  guideCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  guideStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  guideStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#145c44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideStepNumberText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  guideStepInfo: {
    flex: 1,
    gap: 2,
  },
  guideStepTitle: {
    fontSize: 16,
  },
  guideStepDesc: {
    lineHeight: 18,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
  },
  successText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 16,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
  },
  errorBannerText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 15,
  },
});