import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen, ScreenSection } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import {
  getCaregivers,
  getEmergencyContact,
  removeCaregiver,
  updateCaregiver,
  updateEmergencyContact,
  type Caregiver,
  type EmergencyContact,
} from '@/services/medicare-api';

const emptyContact: EmergencyContact = { name: '', relationship: '', phone: '', email: '' };

export default function CaregiverSettingsScreen() {
  const { token } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [contact, setContact] = useState(emptyContact);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [caregiverResult, contactResult] = await Promise.all([getCaregivers(token), getEmergencyContact(token)]);
      setCaregivers(caregiverResult.caregivers);
      setContact({ ...emptyContact, ...contactResult.emergencyContact });
      setError('');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load caregiver settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function saveContact() {
    if (!token) return;
    setIsSaving(true);
    setError('');
    try {
      const result = await updateEmergencyContact(token, contact);
      setContact(result.emergencyContact);
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save emergency contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function makePrimary(caregiver: Caregiver) {
    if (!token) return;
    try {
      await updateCaregiver(token, caregiver._id, { isPrimary: true });
      await load();
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update primary caregiver. Please try again.');
    }
  }

  async function deleteCaregiver(id: string) {
    if (!token) return;
    try {
      await removeCaregiver(token, id);
      setCaregivers((current) => current.filter((item) => item._id !== id));
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to remove caregiver. Please try again.');
    }
  }

  function confirmDelete(caregiver: Caregiver) {
    Alert.alert('Remove caregiver?', `Remove ${caregiver.name} from your caregiver list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void deleteCaregiver(caregiver._id) },
    ]);
  }

  if (isLoading) return <Screen title="Emergency & caregivers"><View style={styles.state}><ActivityIndicator size="large" /><ThemedText>Loading caregiver settings...</ThemedText></View></Screen>;

  return (
    <Screen title="Emergency & caregivers" subtitle="Emergency contact and caregivers are managed separately">
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
      <ScreenSection title="Emergency contact">
        <ThemedText type="small" themeColor="textSecondary">This contact is not automatically a caregiver.</ThemedText>
        <FormField label="Name" value={contact.name} onChangeText={(name) => { setContact((current) => ({ ...current, name })); setSaved(false); }} />
        <FormField label="Relationship" value={contact.relationship} onChangeText={(relationship) => { setContact((current) => ({ ...current, relationship })); setSaved(false); }} />
        <FormField label="Phone number" value={contact.phone} onChangeText={(phone) => { setContact((current) => ({ ...current, phone })); setSaved(false); }} keyboardType="phone-pad" />
        <FormField label="Email (optional)" value={contact.email} onChangeText={(email) => { setContact((current) => ({ ...current, email })); setSaved(false); }} keyboardType="email-address" autoCapitalize="none" />
        <ActionButton label={saved ? 'Emergency contact saved' : 'Save emergency contact'} loading={isSaving} onPress={() => void saveContact()} />
      </ScreenSection>
      <ScreenSection title="Caregivers">
        {caregivers.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.empty}>
            <ThemedText>No caregivers added yet.</ThemedText>
          </ThemedView>
        ) : caregivers.map((caregiver) => (
          <CaregiverCard
            key={caregiver._id}
            caregiver={caregiver}
            onPrimary={() => void makePrimary(caregiver)}
            onEdit={() => router.push({ pathname: '/settings/add-caregiver', params: { id: caregiver._id } } as unknown as Href)}
            onRemove={() => confirmDelete(caregiver)}
          />
        ))}
        <ActionButton label="Add caregiver" onPress={() => router.push('/settings/add-caregiver' as Href)} />
      </ScreenSection>
    </Screen>
  );
}

function CaregiverCard({ caregiver, onPrimary, onEdit, onRemove }: { caregiver: Caregiver; onPrimary: () => void; onEdit: () => void; onRemove: () => void }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardTitle}>
        <ThemedText type="smallBold" style={styles.cardName}>{caregiver.name}</ThemedText>
        {caregiver.isPrimary ? <ThemedText type="smallBold">Primary</ThemedText> : null}
      </View>
      <ThemedText>{caregiver.relationship} · {caregiver.phone}</ThemedText>
      {caregiver.email ? <ThemedText>{caregiver.email}</ThemedText> : null}
      <ThemedText type="small" themeColor="textSecondary">Medication alerts: {caregiver.medicationAlerts ? 'Allowed' : 'Off'}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Missed medication alerts: {caregiver.missedMedicationAlerts ? 'Allowed' : 'Off'}</ThemedText>
      <View style={styles.actions}>
        {!caregiver.isPrimary ? <ActionButton label="Set primary" secondary onPress={onPrimary} style={styles.action} /> : null}
        <ActionButton label="Edit" secondary onPress={onEdit} style={styles.action} />
        <ActionButton label="Remove" destructive onPress={onRemove} style={styles.action} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  error: { color: '#a22121' },
  empty: { padding: Spacing.three, borderRadius: 8 },
  card: { padding: Spacing.three, borderRadius: 8, gap: Spacing.two },
  cardTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  cardName: { flex: 1, fontSize: 19 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  action: { flexGrow: 1 },
});