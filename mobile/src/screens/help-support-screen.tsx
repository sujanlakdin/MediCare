import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { SettingsLink } from '@/components/settings-link';
import { useAuth } from '@/contexts/auth-context';
import { ApiError, apiRequest } from '@/services/api';

export default function HelpSupportScreen() {
  const { token } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!token) return;
    if (subject.trim().length < 3 || description.trim().length < 10) {
      setError('Enter a subject and a description of at least 10 characters.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await apiRequest('/api/support', { method: 'POST', token, body: { subject, description } });
      setSent(true);
      setSubject('');
      setDescription('');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to send your request. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen title="Help & support" subtitle="Send a question or report a problem">
      {sent ? <ThemedText accessibilityRole="alert">Your support request was sent.</ThemedText> : null}
      <FormField label="Subject" value={subject} onChangeText={setSubject} maxLength={120} />
      <FormField label="Description" value={description} onChangeText={setDescription} multiline maxLength={4000} style={styles.description} />
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
      <ActionButton label="Send support request" loading={isSaving} onPress={() => void submit()} />
      {isSaving ? <View style={styles.progress}><ActivityIndicator accessibilityLabel="Sending support request" /></View> : null}
      <ThemedText type="small" themeColor="textSecondary">MediCare support requests are linked to your signed-in account.</ThemedText>
      <SettingsLink href="/settings/faq" title="Frequently asked questions" subtitle="Read common answers about MediCare" symbol={{ ios: 'text.bubble', android: 'quiz', web: 'quiz' }} />
      <ThemedText type="smallBold">App information</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">MediCare Medication Reminder and Adherence Tracker. Contact support using the form above.</ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({ description: { minHeight: 150, textAlignVertical: 'top', paddingTop: 14 }, error: { color: '#a22121' }, progress: { alignItems: 'center' } });