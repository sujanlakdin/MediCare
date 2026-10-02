import { router, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { Screen } from '@/components/screen';
import { SettingsLink } from '@/components/settings-link';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  return (
    <Screen title="Settings" subtitle="Manage your account and preferences">
      <SettingsLink href="/settings/notifications" title="Notifications" subtitle="Medication and caregiver alerts" symbol={{ ios: 'bell', android: 'notifications', web: 'notifications' }} />
      <SettingsLink href="/settings/accessibility" title="Accessibility" subtitle="Text size, contrast, and motion" symbol={{ ios: 'accessibility', android: 'accessibility', web: 'accessibility' }} />
      <SettingsLink href="/settings/caregivers" title="Emergency & caregivers" subtitle="Contacts and caregiver access" symbol={{ ios: 'heart.text.square', android: 'health_and_safety', web: 'health_and_safety' }} />
      <SettingsLink href="/settings/help" title="Help & support" subtitle="Get help or contact support" symbol={{ ios: 'questionmark.circle', android: 'help_outline', web: 'help_outline' }} />
      <SettingsLink href="/settings/faq" title="Frequently asked questions" subtitle="Answers about using MediCare" symbol={{ ios: 'text.bubble', android: 'quiz', web: 'quiz' }} />
      <SettingsLink href="/profile/edit" title="Edit profile" subtitle="Update your personal information" symbol={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }} />
      <ThemedText style={styles.sectionTitle}>Account</ThemedText>
      <ActionButton label="Sign out" destructive onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({ sectionTitle: { marginTop: Spacing.two, fontWeight: '700' } });