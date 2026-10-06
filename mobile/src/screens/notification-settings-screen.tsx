import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import {
  getNotifications,
  updateNotifications,
  type NotificationSettings,
} from '@/services/medicare-api';

const DEFAULT_SETTINGS: NotificationSettings = {
  medicationReminders: true,
  missedMedicationAlerts: true,
  caregiverNotifications: true,
  reminderSound: true,
  vibration: false,
  preferredReminderTime: '08:00',
};

export default function NotificationSettingsScreen() {
  const { token } = useAuth();
  const { settings: a11y } = useAccessibility();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [activeInterval, setActiveInterval] = useState('morning');

  const loadSettings = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await getNotifications(token);
      setSettings({ ...DEFAULT_SETTINGS, ...res.settings });
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function toggle(key: keyof NotificationSettings, val: boolean) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: val };
      // Auto save in background
      if (token) {
        void updateNotifications(token, updated);
      }
      return updated;
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    setError('');
    try {
      await updateNotifications(token, settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to save settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen
      title="Notifications"
      subtitle="Configure reminder preferences"
      showBack={true}
      activeTab="alerts">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" />
          <Text style={styles.loadingText}>Loading notification preferences...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {/* Card 1: Direct Alerts & Reminders */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Direct Alerts & Reminders</Text>

            {/* Medication Reminders */}
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Medication Reminders</Text>
                <Text style={styles.itemSubtitle}>Notify when doses are due</Text>
              </View>
              <Switch
                value={settings.medicationReminders}
                onValueChange={(v) => toggle('medicationReminders', v)}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Medication Reminders"
              />
            </View>

            <View style={styles.divider} />

            {/* Missed-Dose Alerts */}
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Missed-Dose Alerts</Text>
                <Text style={styles.itemSubtitle}>Critical warnings on missed doses</Text>
              </View>
              <Switch
                value={settings.missedMedicationAlerts}
                onValueChange={(v) => toggle('missedMedicationAlerts', v)}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Missed-Dose Alerts"
              />
            </View>

            <View style={styles.divider} />

            {/* Caregiver Sync */}
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Caregiver Sync</Text>
                <Text style={styles.itemSubtitle}>Instantly notify designated caregiver</Text>
              </View>
              <Switch
                value={settings.caregiverNotifications}
                onValueChange={(v) => toggle('caregiverNotifications', v)}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Caregiver Sync"
              />
            </View>

            <View style={styles.divider} />

            {/* Sound Assistance */}
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Sound Assistance</Text>
                <Text style={styles.itemSubtitle}>Play loud voice-spoken prompt</Text>
              </View>
              <Switch
                value={settings.reminderSound}
                onValueChange={(v) => toggle('reminderSound', v)}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Sound Assistance"
              />
            </View>

            <View style={styles.divider} />

            {/* Vibration Mode */}
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>Vibration Mode</Text>
                <Text style={styles.itemSubtitle}>Strong haptic feedback alerts</Text>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={(v) => toggle('vibration', v)}
                trackColor={{ true: '#22996E', false: '#D9E3DE' }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Vibration Mode"
              />
            </View>
          </View>

          {/* Card 2: Time Interval Checklists */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Time Interval Checklists</Text>
            <View style={styles.chipsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Morning at 8:00 AM"
                onPress={() => setActiveInterval('morning')}
                style={[
                  styles.chip,
                  activeInterval === 'morning' && styles.activeChip,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    activeInterval === 'morning' && styles.activeChipText,
                  ]}>
                  Morning • 8:00 AM
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Noon at 12:30 PM"
                onPress={() => setActiveInterval('noon')}
                style={[
                  styles.chip,
                  activeInterval === 'noon' && styles.activeChip,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    activeInterval === 'noon' && styles.activeChipText,
                  ]}>
                  Noon • 12:30 PM
                </Text>
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {saveSuccess ? (
            <Text style={styles.successText}>✓ Notification preferences saved</Text>
          ) : null}

          {/* Save Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save Notification Preferences"
            disabled={isSaving}
            onPress={() => void handleSave()}
            style={({ pressed }) => [
              styles.saveButton,
              a11y.largerButtons && styles.largeSaveButton,
              pressed && styles.pressed,
            ]}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Notification Preferences</Text>
            )}
          </Pressable>
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E3E2F',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#71827A',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#F3F9F5',
    borderWidth: 1,
    borderColor: '#D8E8DF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activeChip: {
    backgroundColor: '#E7F5EE',
    borderColor: '#B9E3CE',
  },
  chipText: {
    fontSize: 13,
    color: '#4A6054',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#1B7D54',
    fontWeight: '700',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  successText: {
    color: '#1B7D54',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#22996E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#22996E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  largeSaveButton: {
    height: 62,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});