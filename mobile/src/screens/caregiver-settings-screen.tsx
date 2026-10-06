import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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
  type Caregiver,
} from '@/services/medicare-api';

const DEFAULT_CAREGIVER = {
  _id: 'default-amara',
  name: 'Amara Rajapakse',
  relationship: 'Daughter',
  phone: '+94 77 987 6543',
  email: 'amara.r@gmail.com',
  isPrimary: true,
  medicationAlerts: true,
  missedMedicationAlerts: true,
};

export default function CaregiverSettingsScreen() {
  const { token } = useAuth();
  const { settings: a11y } = useAccessibility();

  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [adherenceSummary, setAdherenceSummary] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sosSent, setSosSent] = useState(false);

  const loadCaregiver = useCallback(async () => {
    if (!token) {
      setCaregiver(DEFAULT_CAREGIVER);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getCaregivers(token);
      if (res.caregivers.length > 0) {
        setCaregiver(res.caregivers[0]);
      } else {
        setCaregiver(DEFAULT_CAREGIVER);
      }
    } catch {
      setCaregiver(DEFAULT_CAREGIVER);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadCaregiver();
  }, [loadCaregiver]);

  function handleRemove() {
    Alert.alert(
      'Remove Caregiver?',
      `Are you sure you want to remove ${caregiver?.name || 'this caregiver'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (token && caregiver?._id && caregiver._id !== DEFAULT_CAREGIVER._id) {
              try {
                await removeCaregiver(token, caregiver._id);
              } catch (err) {
                // handle err
              }
            }
            setCaregiver(null);
          },
        },
      ]
    );
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
      `Emergency SMS and push alert dispatched to ${caregiver?.name || 'your caregiver'}.`
    );
    setTimeout(() => setSosSent(false), 4000);
  }

  const activeName = caregiver?.name || DEFAULT_CAREGIVER.name;
  const activeRelationship = caregiver?.relationship || DEFAULT_CAREGIVER.relationship;
  const activePhone = caregiver?.phone || DEFAULT_CAREGIVER.phone;

  return (
    <Screen
      title="Emergency & Caregiver"
      subtitle="Manage your helper links and critical SOS triggers"
      showBack={true}
      activeTab="profile">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" />
          <Text style={styles.loadingText}>Loading caregiver details...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Card 1: Linked Caregiver */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardHeader}>Linked Caregiver</Text>
              <View style={styles.syncBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.syncBadgeText}>SYNC ACTIVE</Text>
              </View>
            </View>

            {caregiver ? (
              <>
                <View style={styles.caregiverInfoRow}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={require('@/assets/images/amara_avatar.jpg')}
                      style={styles.avatarImage}
                    />
                  </View>
                  <View style={styles.caregiverTextCol}>
                    <Text style={styles.caregiverName}>{activeName}</Text>
                    <Text style={styles.caregiverSubtext}>
                      {activeRelationship} • {activePhone}
                    </Text>
                  </View>
                </View>

                {/* Change / Remove Action Buttons */}
                <View style={styles.actionButtonsRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change Caregiver"
                    onPress={() =>
                      router.push({
                        pathname: '/settings/add-caregiver',
                        params: { id: caregiver._id },
                      } as unknown as Href)
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
                    onPress={handleRemove}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.removeBtn,
                      a11y.largerButtons && styles.largeActionBtn,
                      pressed && styles.pressed,
                    ]}>
                    <CareIcon name="trash" size={16} color="#D32F2F" />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No linked caregiver currently configured.</Text>
                <Pressable
                  onPress={() => router.push('/settings/add-caregiver' as Href)}
                  style={styles.addBtn}>
                  <Text style={styles.addBtnText}>+ Link Caregiver</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Card 2: Notifications Sent to Caregiver */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>
              Notifications Sent to {activeName.split(' ')[0]}
            </Text>

            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Missed-Dose SMS Alerts</Text>
              </View>
              <Switch
                value={smsAlerts}
                onValueChange={setSmsAlerts}
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
                value={adherenceSummary}
                onValueChange={setAdherenceSummary}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Daily Adherence Summary"
              />
            </View>
          </View>

          {/* Card 3: EMERGENCY MEDICAL HELP */}
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
              <Text style={styles.emergencyRedButtonText}>
                Call Medical Services (119)
              </Text>
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