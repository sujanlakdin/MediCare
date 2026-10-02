import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { Screen, ScreenSection } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import {
  getCaregivers,
  removeCaregiver,
  updateCaregiver,
  type Caregiver,
} from '@/services/medicare-api';

export default function CaregiverSettingsScreen() {
  const { token } = useAuth();
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sosSent, setSosSent] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');
    try {
      const caregiverResult = await getCaregivers(token);
      setCaregivers(caregiverResult.caregivers);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to load caregiver data. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  async function handleToggleSync(caregiver: Caregiver) {
    if (!token) return;
    const nextActive = caregiver.active === undefined ? false : !caregiver.active;
    try {
      await updateCaregiver(token, caregiver._id, { active: nextActive });
      setCaregivers((prev) =>
        prev.map((c) => (c._id === caregiver._id ? { ...c, active: nextActive } : c))
      );
    } catch (requestError) {
      Alert.alert(
        'Error',
        requestError instanceof ApiError ? requestError.message : 'Unable to update status.'
      );
    }
  }

  async function handleToggleNotificationPref(
    caregiver: Caregiver,
    key: 'medicationAlerts' | 'dailyAdherenceSummary',
    val: boolean
  ) {
    if (!token) return;
    try {
      await updateCaregiver(token, caregiver._id, { [key]: val });
      setCaregivers((prev) =>
        prev.map((c) => (c._id === caregiver._id ? { ...c, [key]: val } : c))
      );
    } catch (requestError) {
      Alert.alert(
        'Error',
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to update notification preference.'
      );
    }
  }

  function confirmDelete(caregiver: Caregiver) {
    Alert.alert(
      'Remove Caregiver',
      `Are you sure you want to remove ${caregiver.name} from your linked caregivers?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            try {
              await removeCaregiver(token, caregiver._id);
              setCaregivers((prev) => prev.filter((c) => c._id !== caregiver._id));
            } catch (requestError) {
              Alert.alert(
                'Error',
                requestError instanceof ApiError
                  ? requestError.message
                  : 'Unable to remove caregiver.'
              );
            }
          },
        },
      ]
    );
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

  function handleSendSosAlert() {
    if (caregivers.length === 0) {
      Alert.alert(
        'No Caregiver Linked',
        'Please add a caregiver first so they can receive your SOS alerts.'
      );
      return;
    }

    Alert.alert(
      'Confirm SOS Alert',
      'Send immediate SOS notification to all linked caregivers with your alert status?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS Alert',
          style: 'destructive',
          onPress: () => {
            setSosSent(true);
            setTimeout(() => setSosSent(false), 5000);
          },
        },
      ]
    );
  }

  if (isLoading && caregivers.length === 0) {
    return (
      <Screen title="Emergency & Caregiver" subtitle="Manage who can support you in an emergency">
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#145c44" />
          <ThemedText style={styles.loadingText}>Loading caregiver details...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Emergency & Caregiver"
      subtitle="Manage who can support you in an emergency"
      simpleSubtitle="Emergency and helper settings"
      refreshing={isRefreshing}
      onRefresh={() => void loadData(true)}>
      {sosSent ? (
        <View style={styles.sosBanner} accessibilityRole="alert">
          <SymbolView
            name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified' }}
            size={24}
            tintColor="#166534"
          />
          <View style={styles.sosBannerText}>
            <ThemedText style={styles.sosBannerTitle}>SOS Alert Dispatched</ThemedText>
            <ThemedText style={styles.sosBannerDesc}>
              All active linked caregivers have been notified with urgent priority.
            </ThemedText>
          </View>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <ActionButton label="Try again" onPress={() => void loadData()} />
        </View>
      ) : null}

      {/* Linked Caregivers Section */}
      <ScreenSection title="Linked Caregiver">
        {caregivers.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <SymbolView
              name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
              size={36}
              tintColor="#9ca3af"
            />
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No Linked Caregivers Yet
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
              Link a family member, nurse, or friend who can assist you in an emergency.
            </ThemedText>
          </ThemedView>
        ) : (
          caregivers.map((caregiver) => (
            <CaregiverItemCard
              key={caregiver._id}
              caregiver={caregiver}
              onToggleSync={() => void handleToggleSync(caregiver)}
              onToggleDoseAlerts={(val) =>
                void handleToggleNotificationPref(caregiver, 'medicationAlerts', val)
              }
              onToggleSummary={(val) =>
                void handleToggleNotificationPref(caregiver, 'dailyAdherenceSummary', val)
              }
              onEdit={() =>
                router.push({
                  pathname: '/settings/add-caregiver',
                  params: { id: caregiver._id },
                } as unknown as Href)
              }
              onRemove={() => confirmDelete(caregiver)}
            />
          ))
        )}

        <ActionButton
          label="+ Add Caregiver"
          secondary
          onPress={() => router.push('/settings/add-caregiver' as Href)}
        />
      </ScreenSection>

      {/* Emergency Medical Help Section */}
      <ScreenSection title="Emergency Medical Help">
        <ThemedView type="backgroundElement" style={styles.emergencyCard}>
          <View style={styles.emergencyCardHeader}>
            <View style={styles.emergencyIconContainer}>
              <SymbolView
                name={{ ios: 'exclamationmark.octagon.fill', android: 'emergency', web: 'emergency' }}
                size={28}
                tintColor="#dc2626"
              />
            </View>
            <View style={styles.emergencyHeaderText}>
              <ThemedText type="smallBold" style={styles.emergencyTitle}>
                Immediate Medical Assistance
              </ThemedText>
              <ThemedText type="small" style={styles.emergencyDesc}>
                Quick access for urgent medical care or critical caregiver distress.
              </ThemedText>
            </View>
          </View>

          <View style={styles.emergencyButtons}>
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notify Caregiver SOS Alert"
              accessibilityHint="Sends immediate alert to all linked caregivers"
              onPress={handleSendSosAlert}
              style={({ pressed }) => [
                styles.sosAlertBtn,
                a11y.largerButtons && styles.largeEmergencyBtn,
                pressed && styles.btnPressed,
              ]}>
              <SymbolView
                name={{ ios: 'bell.badge.fill', android: 'crisis_alert', web: 'notification_important' }}
                size={24}
                tintColor="#b91c1c"
              />
              <ThemedText style={styles.sosAlertBtnText}>
                Notify Caregiver (SOS Alert)
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScreenSection>
    </Screen>
  );
}

function CaregiverItemCard({
  caregiver,
  onToggleSync,
  onToggleDoseAlerts,
  onToggleSummary,
  onEdit,
  onRemove,
}: {
  caregiver: Caregiver;
  onToggleSync: () => void;
  onToggleDoseAlerts: (val: boolean) => void;
  onToggleSummary: (val: boolean) => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const isActive = caregiver.active !== false;

  const initials = caregiver.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <ThemedView type="backgroundElement" style={styles.caregiverCard}>
      {/* Profile Row */}
      <View style={styles.caregiverHeader}>
        <View style={styles.caregiverAvatar}>
          <ThemedText style={styles.avatarInitials}>{initials}</ThemedText>
        </View>

        <View style={styles.caregiverInfo}>
          <View style={styles.nameRow}>
            <ThemedText type="smallBold" style={styles.caregiverName}>
              {caregiver.name}
            </ThemedText>
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusActive : styles.statusInactive,
              ]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? '#166534' : '#6b7280' },
                ]}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: isActive ? '#166534' : '#6b7280' },
                ]}>
                {isActive ? 'Sync Active' : 'Paused'}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            {caregiver.relationship} · {caregiver.phone}
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.caregiverActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Toggle sync for ${caregiver.name}`}
          onPress={onToggleSync}
          style={styles.actionChip}>
          <SymbolView
            name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }}
            size={16}
            tintColor="#145c44"
          />
          <ThemedText style={styles.actionChipText}>
            {isActive ? 'Pause Sync' : 'Resume Sync'}
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${caregiver.name}`}
          onPress={onEdit}
          style={styles.actionChip}>
          <SymbolView
            name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
            size={16}
            tintColor="#145c44"
          />
          <ThemedText style={styles.actionChipText}>Edit</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${caregiver.name}`}
          onPress={onRemove}
          style={[styles.actionChip, styles.actionChipDestructive]}>
          <SymbolView
            name={{ ios: 'trash', android: 'delete', web: 'delete' }}
            size={16}
            tintColor="#dc2626"
          />
          <ThemedText style={styles.actionChipDestructiveText}>Remove</ThemedText>
        </Pressable>
      </View>

      {/* Notification Preferences */}
      <View style={styles.caregiverPrefs}>
        <ThemedText type="smallBold" style={styles.prefsTitle}>
          Notification Settings
        </ThemedText>

        <View style={styles.prefRow}>
          <View style={styles.prefCopy}>
            <ThemedText type="small" style={styles.prefLabel}>
              Medication Dose SMS Alerts
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.prefDesc}>
              Notify when a scheduled dose is taken or missed
            </ThemedText>
          </View>
          <Switch
            value={caregiver.medicationAlerts ?? true}
            onValueChange={onToggleDoseAlerts}
            accessibilityRole="switch"
            accessibilityLabel="Medication Dose SMS Alerts"
            trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.prefRow}>
          <View style={styles.prefCopy}>
            <ThemedText type="small" style={styles.prefLabel}>
              Daily Adherence Summary
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.prefDesc}>
              Send evening report of medication compliance
            </ThemedText>
          </View>
          <Switch
            value={caregiver.dailyAdherenceSummary ?? true}
            onValueChange={onToggleSummary}
            accessibilityRole="switch"
            accessibilityLabel="Daily Adherence Summary"
            trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  loadingText: {
    fontSize: 16,
    color: '#60646C',
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  errorText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 15,
  },
  sosBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
  sosBannerText: {
    flex: 1,
    gap: 2,
  },
  sosBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  sosBannerDesc: {
    fontSize: 14,
    color: '#15803d',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: Spacing.two,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: Spacing.one,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  caregiverCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: Spacing.four,
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  caregiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  caregiverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#145c44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  caregiverInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  caregiverName: {
    fontSize: 18,
    lineHeight: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f3f4f6',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  caregiverActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#145c44',
  },
  actionChipDestructive: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    marginLeft: 'auto',
  },
  actionChipDestructiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  caregiverPrefs: {
    gap: Spacing.two,
  },
  prefsTitle: {
    fontSize: 13,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  prefCopy: {
    flex: 1,
    gap: 2,
  },
  prefLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  prefDesc: {
    fontSize: 13,
    lineHeight: 16,
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
  emergencyHeaderText: {
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
  emergencyButtons: {
    gap: Spacing.two,
    marginTop: Spacing.one,
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
  sosAlertBtn: {
    minHeight: 54,
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#dc2626',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
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
  sosAlertBtnText: {
    color: '#991b1b',
    fontWeight: '700',
    fontSize: 16,
  },
});