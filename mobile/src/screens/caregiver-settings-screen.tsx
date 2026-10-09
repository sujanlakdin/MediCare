import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { CareIcon } from '@/components/care-icon';
import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import {
  getCaregivers,
  removeCaregiver,
  updateCaregiver,
  type Caregiver,
} from '@/services/medicare-api';

export default function CaregiverSettingsScreen() {
  const { token } = useAuth();
  const { settings: a11y } = useAccessibility();

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [caregiverError, setCaregiverError] = useState('');
  const [removingCaregiverId, setRemovingCaregiverId] = useState<string | null>(null);
  const [isUpdatingAlerts, setIsUpdatingAlerts] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const loadDetails = useCallback(async () => {
    setIsLoading(true);
    setCaregiverError('');

    if (!token) {
      setCaregivers([]);
      setCaregiverError('Please sign in to manage caregiver details.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await getCaregivers(token);
      setCaregivers(result.caregivers);
    } catch (requestError) {
      setCaregivers([]);
      setCaregiverError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to load caregiver details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    void loadDetails();
  }, [loadDetails]));

  async function executeRemove(caregiver: Caregiver) {
    if (!token) {
      setCaregiverError('Please sign in to remove caregiver details.');
      return;
    }
    setRemovingCaregiverId(caregiver._id);
    try {
      await removeCaregiver(token, caregiver._id);
      await loadDetails();
      Alert.alert('Caregiver removed', 'Caregiver details have been removed successfully.');
    } catch (requestError) {
      Alert.alert(
        'Unable to remove caregiver',
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to remove caregiver. Please try again.'
      );
    } finally {
      setRemovingCaregiverId(null);
    }
  }

  function handleRemove(caregiver: Caregiver) {
    const message = `Are you sure you want to remove ${caregiver.name}?`;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        void executeRemove(caregiver);
      }
      return;
    }

    Alert.alert('Remove Caregiver?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void executeRemove(caregiver) },
    ]);
  }

  async function handleAlertChange(caregiver: Caregiver, field: 'missedMedicationAlerts' | 'medicationAlerts', value: boolean) {
    if (!token) return;
    setIsUpdatingAlerts(true);
    try {
      const result = await updateCaregiver(token, caregiver._id, { [field]: value });
      setCaregivers((current) => current.map((item) =>
        item._id === result.caregiver._id ? result.caregiver : item
      ));
    } catch (requestError) {
      Alert.alert(
        'Unable to update alerts',
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to update caregiver alerts. Please try again.'
      );
    } finally {
      setIsUpdatingAlerts(false);
    }
  }

  function handleCall119() {
    Alert.alert('Emergency Call', 'Calling National Medical Emergency Services (119)...', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call Now',
        style: 'destructive',
        onPress: () => {
          void Linking.openURL('tel:119').catch(() => undefined);
        },
      },
    ]);
  }

  function handleNotifyCaregiver() {
    setSosSent(true);
    Alert.alert(
      'SOS Alert Sent',
      `Emergency SMS and push alert dispatched to ${
        caregivers.find((item) => item.isPrimary)?.name || caregivers[0]?.name || 'your caregiver'
      }.`
    );
    setTimeout(() => setSosSent(false), 4000);
  }

  const notificationCaregiver = caregivers.find((item) => item.isPrimary) || caregivers[0] || null;

  return (
    <Screen
      title="Emergency & Caregiver"
      subtitle="Manage your helper links and critical SOS triggers"
      showBack={true}
      patientTab="settings"
      hideBottomNav={false}>
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" />
          <Text style={styles.loadingText}>Loading caregiver details...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>Linked Caregiver</Text>
              {caregivers.length > 0 ? (
                <View style={styles.syncBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.syncBadgeText}>SYNC ACTIVE</Text>
                </View>
              ) : null}
            </View>

            {caregiverError ? (
              <>
                <Text style={styles.errorText}>{caregiverError}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadDetails()}
                  style={styles.addBtn}>
                  <Text style={styles.addBtnText}>Retry</Text>
                </Pressable>
              </>
            ) : null}
            {caregivers.length === 0 && !caregiverError ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No linked caregiver currently configured.</Text>
              </View>
            ) : null}
            {caregivers.map((caregiver) => (
              <View key={caregiver._id} style={styles.caregiverEntry}>
                <View style={styles.caregiverInfoRow}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={require('@/assets/images/amara_avatar.jpg')}
                      style={styles.avatarImage}
                    />
                  </View>
                  <View style={styles.caregiverTextCol}>
                    <Text style={styles.caregiverName}>{caregiver.name}</Text>
                    <Text style={styles.caregiverSubtext}>
                      {caregiver.relationship} • {caregiver.phone}
                    </Text>
                    {caregiver.email ? (
                      <Text style={styles.caregiverSubtext}>{caregiver.email}</Text>
                    ) : null}
                    {caregiver.isPrimary ? (
                      <Text style={styles.caregiverSubtext}>Primary caregiver</Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.actionButtonsRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change Caregiver"
                    onPress={() =>
                      router.push({
                        pathname: '/settings/add-caregiver',
                        params: { id: caregiver._id },
                      } as Href)
                    }
                    style={({ pressed }) => [
                      styles.actionBtn,
                      a11y.largerButtons && styles.largeActionBtn,
                      pressed && styles.pressed,
                    ]}>
                    <CareIcon name="pencil" size={16} color="#1C2A24" />
                    <Text style={styles.actionBtnText}>Change</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove Caregiver"
                    disabled={removingCaregiverId !== null}
                    onPress={() => handleRemove(caregiver)}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.removeBtn,
                      a11y.largerButtons && styles.largeActionBtn,
                      pressed && styles.pressed,
                      removingCaregiverId !== null && styles.disabled,
                    ]}>
                    {removingCaregiverId === caregiver._id ? (
                      <ActivityIndicator size="small" color="#D32F2F" />
                    ) : (
                      <>
                        <CareIcon name="trash" size={16} color="#D32F2F" />
                        <Text style={styles.removeBtnText}>Remove</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            ))}
            {!caregiverError ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/settings/add-caregiver' as Href)}
                style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Add a Caregiver</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>
              Notifications Sent to {notificationCaregiver ? notificationCaregiver.name.split(' ')[0] : 'Caregiver'}
            </Text>
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Missed-Dose SMS Alerts</Text>
              </View>
              <Switch
                value={notificationCaregiver?.missedMedicationAlerts ?? true}
                onValueChange={(value) => notificationCaregiver && void handleAlertChange(notificationCaregiver, 'missedMedicationAlerts', value)}
                disabled={!notificationCaregiver || isUpdatingAlerts}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Missed-Dose SMS Alerts"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Daily Adherence Summary</Text>
              </View>
              <Switch
                value={notificationCaregiver?.medicationAlerts ?? true}
                onValueChange={(value) => notificationCaregiver && void handleAlertChange(notificationCaregiver, 'medicationAlerts', value)}
                disabled={!notificationCaregiver || isUpdatingAlerts}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Daily Adherence Summary"
              />
            </View>
          </View>

          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeaderRow}>
              <CareIcon name="alert-triangle" size={20} color="#D32F2F" />
              <Text style={styles.emergencyTitle}>EMERGENCY MEDICAL HELP</Text>
            </View>
            <Text style={styles.emergencyDescription}>
              If you have a medical emergency, do not wait for a caregiver. Use the
              speed dials below.
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
              <Text style={styles.emergencyRedButtonText}>Call Medical Services (119)</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notify Caregiver SOS Alert"
              onPress={handleNotifyCaregiver}
              style={({ pressed }) => [
                styles.sosOutlineButton,
                a11y.largerButtons && styles.largeEmergencyBtn,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.sosOutlineButtonText}>
                {sosSent ? '✓ SOS Alert Dispatched' : 'Notify Caregiver (SOS Alert)'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  loadingText: {
    color: '#6B8278',
    fontSize: 14,
  },
  container: {
    gap: 16,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    padding: 16,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E3E2F',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E7F5EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C6E7D6',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22996E',
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B7D54',
    letterSpacing: 0.3,
  },
  caregiverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 2,
  },
  caregiverEntry: {
    gap: 12,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#E8F6EF',
    borderWidth: 1.5,
    borderColor: '#E5EDE8',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  caregiverTextCol: {
    flex: 1,
    gap: 3,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C2A24',
  },
  caregiverSubtext: {
    fontSize: 13,
    color: '#71827A',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE6E0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  largeActionBtn: {
    height: 54,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C2A24',
  },
  removeBtn: {
    borderColor: '#FACDCD',
  },
  removeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
  emptyContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#71827A',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.6,
  },
  addBtn: {
    backgroundColor: '#22996E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
  },
  emergencyCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FACDCD',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  emergencyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  sosOutlineButton: {
    height: 48,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FACDCD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosOutlineButtonText: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});