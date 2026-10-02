import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
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
  getNotifications,
  updateNotifications,
  type NotificationSettings,
} from '@/services/medicare-api';

const defaultSettings: NotificationSettings = {
  medicationReminders: true,
  missedDoseAlerts: true,
  caregiverSync: true,
  soundAssistance: true,
  vibrationMode: true,
  reminderSound: true,
  vibration: true,
  missedMedicationAlerts: true,
  caregiverNotifications: true,
  preferredReminderTime: '09:00',
  morningReminderTime: '08:00',
  noonReminderTime: '12:30',
  eveningReminderTime: '20:00',
};

export default function NotificationSettingsScreen() {
  const { token } = useAuth();
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await getNotifications(token);
      setSettings({
        ...defaultSettings,
        ...result.settings,
        // Align aliases if server returned original keys
        missedDoseAlerts:
          result.settings.missedDoseAlerts ?? result.settings.missedMedicationAlerts ?? true,
        caregiverSync:
          result.settings.caregiverSync ?? result.settings.caregiverNotifications ?? true,
        soundAssistance:
          result.settings.soundAssistance ?? result.settings.reminderSound ?? true,
        vibrationMode:
          result.settings.vibrationMode ?? result.settings.vibration ?? true,
      });
      setHasChanges(false);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to load notification settings. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function handleToggle(key: keyof NotificationSettings, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSuccessMessage('');
  }

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await updateNotifications(token, settings);
      setSettings((prev) => ({
        ...prev,
        ...result.settings,
      }));
      setSuccessMessage('Notification settings saved successfully.');
      setHasChanges(false);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to save notification settings. Please check your connection.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Notifications" subtitle="Configure reminder preferences">
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#145c44" />
          <ThemedText style={styles.loadingText}>Loading reminder preferences...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Notifications"
      subtitle="Configure reminder preferences"
      simpleSubtitle="Reminder settings">
      {successMessage ? (
        <View style={styles.successBanner} accessibilityRole="alert">
          <ThemedText style={styles.successText}>✓ {successMessage}</ThemedText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <ThemedText style={styles.errorBannerText}>{error}</ThemedText>
          <ActionButton label="Try again" onPress={() => void loadSettings()} />
        </View>
      ) : null}

      {/* Medication Alerts & Reminders */}
      <ScreenSection title="Medication Alerts & Reminders">
        <NotificationToggle
          title="Medication Reminders"
          description="Get notified when it's time to take medication"
          value={settings.medicationReminders}
          onValueChange={(val) => handleToggle('medicationReminders', val)}
          icon={{ ios: 'pills.fill', android: 'medication', web: 'medication' }}
        />

        <NotificationToggle
          title="Missed-Dose Alerts"
          description="Get alerts when doses are missed"
          value={settings.missedDoseAlerts}
          onValueChange={(val) => handleToggle('missedDoseAlerts', val)}
          icon={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
        />

        <NotificationToggle
          title="Caregiver Sync"
          description="Keep caregiver notified about medication"
          value={settings.caregiverSync}
          onValueChange={(val) => handleToggle('caregiverSync', val)}
          icon={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
        />

        <NotificationToggle
          title="Sound Assistance"
          description="Play voice reminders"
          value={settings.soundAssistance}
          onValueChange={(val) => handleToggle('soundAssistance', val)}
          icon={{ ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' }}
        />

        <NotificationToggle
          title="Vibration Mode"
          description="Strong feedback for alerts"
          value={settings.vibrationMode}
          onValueChange={(val) => handleToggle('vibrationMode', val)}
          icon={{ ios: 'iphone.radiowaves.left.and.right', android: 'vibration', web: 'vibration' }}
        />
      </ScreenSection>

      {/* Time Interval Checks */}
      <ScreenSection title="Time Interval Checks">
        <ThemedView type="backgroundElement" style={styles.intervalsCard}>
          <IntervalItem
            period="Morning"
            time="8:00 AM"
            description="Breakfast medication window"
            icon={{ ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' }}
          />
          <View style={styles.separator} />
          <IntervalItem
            period="Noon"
            time="12:30 PM"
            description="Lunch medication window"
            icon={{ ios: 'sun.horizon.fill', android: 'light_mode', web: 'light_mode' }}
          />
          <View style={styles.separator} />
          <IntervalItem
            period="Evening"
            time="8:00 PM"
            description="Bedtime medication window"
            icon={{ ios: 'moon.stars.fill', android: 'bedtime', web: 'bedtime' }}
          />
        </ThemedView>
      </ScreenSection>

      <View style={styles.saveGroup}>
        <ActionButton
          label={isSaving ? 'Saving Preferences...' : hasChanges ? 'Save Changes' : 'Saved'}
          loading={isSaving}
          onPress={() => void handleSave()}
        />
      </View>
    </Screen>
  );
}

function NotificationToggle({
  title,
  description,
  value,
  onValueChange,
  icon,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  icon: { ios?: any; android?: string; web?: string };
}) {
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.toggleRow,
        a11y.largerButtons && styles.largeToggleRow,
      ]}>
      <View style={styles.iconWrapper}>
        <SymbolView name={icon} size={22} tintColor="#145c44" />
      </View>

      <View style={styles.toggleContent}>
        <ThemedText type="smallBold" style={styles.toggleTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.toggleDesc}>
          {description}
        </ThemedText>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityHint={description}
        trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
        thumbColor="#ffffff"
      />
    </ThemedView>
  );
}

function IntervalItem({
  period,
  time,
  description,
  icon,
}: {
  period: string;
  time: string;
  description: string;
  icon: { ios?: any; android?: string; web?: string };
}) {
  return (
    <View style={styles.intervalItem}>
      <View style={styles.intervalIconWrapper}>
        <SymbolView name={icon} size={20} tintColor="#145c44" />
      </View>
      <View style={styles.intervalInfo}>
        <View style={styles.intervalHeaderRow}>
          <ThemedText type="smallBold" style={styles.intervalPeriod}>
            {period}
          </ThemedText>
          <ThemedText style={styles.intervalTimeBadge}>{time}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      </View>
    </View>
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
  toggleRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: Spacing.two,
  },
  largeToggleRow: {
    minHeight: 88,
    paddingVertical: Spacing.four,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContent: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  toggleDesc: {
    lineHeight: 18,
  },
  intervalsCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: Spacing.three,
  },
  intervalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  intervalIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalInfo: {
    flex: 1,
    gap: 2,
  },
  intervalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intervalPeriod: {
    fontSize: 16,
  },
  intervalTimeBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#145c44',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginVertical: Spacing.one,
  },
  saveGroup: {
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
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
    gap: Spacing.two,
  },
  errorBannerText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 15,
  },
});