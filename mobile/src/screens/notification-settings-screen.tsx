import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { getNotifications, updateNotifications, type NotificationSettings } from '@/services/medicare-api';

const defaults: NotificationSettings = {
  medicationReminders: true,
  reminderSound: true,
  vibration: true,
  missedMedicationAlerts: true,
  caregiverNotifications: true,
  preferredReminderTime: '09:00',
};

export default function NotificationSettingsScreen() {
  const { token } = useAuth();
  const theme = useTheme();
  const [settings, setSettings] = useState(defaults);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getNotifications(token);
      setSettings({ ...defaults, ...result.settings });
      setError('');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  function toggle(key: keyof NotificationSettings, value: boolean) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function save() {
    if (!token) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(settings.preferredReminderTime)) {
      setError('Enter a reminder time in 24-hour format, for example 09:00.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const result = await updateNotifications(token, settings);
      setSettings({ ...defaults, ...result.settings });
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <Screen title="Notifications"><View style={styles.state}><ActivityIndicator size="large" /><ThemedText>Loading notification settings...</ThemedText></View></Screen>;

  return (
    <Screen title="Notifications" subtitle="Choose which reminders you receive">
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
      {!error ? (
        <>
          <Toggle label="Medication reminders" detail="Receive a reminder at your scheduled time" value={settings.medicationReminders} onValueChange={(value) => toggle('medicationReminders', value)} />
          <Toggle label="Reminder sound" detail="Play a sound with medication reminders" value={settings.reminderSound} onValueChange={(value) => toggle('reminderSound', value)} />
          <Toggle label="Vibration" detail="Vibrate when a reminder appears" value={settings.vibration} onValueChange={(value) => toggle('vibration', value)} />
          <Toggle label="Missed medication alerts" detail="Be notified if a medication is marked missed" value={settings.missedMedicationAlerts} onValueChange={(value) => toggle('missedMedicationAlerts', value)} />
          <Toggle label="Caregiver notifications" detail="Allow caregiver-related notifications" value={settings.caregiverNotifications} onValueChange={(value) => toggle('caregiverNotifications', value)} />
          <FormField label="Preferred reminder time (24-hour)" value={settings.preferredReminderTime} onChangeText={(value) => { setSettings((current) => ({ ...current, preferredReminderTime: value })); setSaved(false); }} placeholder="09:00" keyboardType="numbers-and-punctuation" />
          <ActionButton label={saved ? 'Settings saved' : 'Save settings'} loading={isSaving} onPress={() => void save()} />
        </>
      ) : <ActionButton label="Try again" onPress={() => void load()} />}
    </Screen>
  );

  function Toggle({ label, detail, value, onValueChange }: { label: string; detail: string; value: boolean; onValueChange: (value: boolean) => void }) {
    return (
      <View style={styles.row}>
        <View style={styles.copy}>
          <ThemedText type="smallBold">{label}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{detail}</ThemedText>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityHint={detail}
          trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', gap: 16, paddingVertical: 40 },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#777777' },
  copy: { flex: 1, gap: 4 },
  error: { color: '#a22121' },
});