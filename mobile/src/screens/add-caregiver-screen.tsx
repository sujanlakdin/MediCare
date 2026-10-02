import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { createCaregiver, getCaregivers, updateCaregiver, type Caregiver } from '@/services/medicare-api';

type CaregiverForm = Omit<Caregiver, '_id'>;
const emptyCaregiver: CaregiverForm = {
  name: '', relationship: '', phone: '', email: '', isPrimary: false,
  medicationAlerts: true, missedMedicationAlerts: true,
};

export default function AddCaregiverScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token } = useAuth();
  const [fields, setFields] = useState<CaregiverForm>(emptyCaregiver);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !token) return;
    let active = true;
    void getCaregivers(token).then(({ caregivers }) => {
      const caregiver = caregivers.find((item) => item._id === id);
      if (!caregiver) throw new Error('Caregiver not found.');
      if (active) {
        const { _id: _caregiverId, ...form } = caregiver;
        setFields(form);
      }
    }).catch((requestError) => {
      if (active) setError(requestError instanceof ApiError ? requestError.message : 'Unable to load this caregiver. Please try again.');
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, [id, token]);

  function update<K extends keyof CaregiverForm>(key: K, value: CaregiverForm[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    if (!token) return;
    if (fields.name.trim().length < 2 || !fields.relationship.trim() || fields.phone.replace(/\D/g, '').length < 7) {
      setError('Enter a name, relationship, and valid phone number.');
      return;
    }
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      setError('Enter a valid email address or leave it blank.');
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      if (id) await updateCaregiver(token, id, fields);
      else await createCaregiver(token, fields);
      router.replace('/settings/caregivers' as Href);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to save caregiver. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <Screen title="Caregiver"><View style={styles.state}><ActivityIndicator size="large" /><ThemedText>Loading caregiver...</ThemedText></View></Screen>;

  return (
    <Screen title={id ? 'Edit caregiver' : 'Add caregiver'} subtitle="Caregivers are linked to your account">
      <FormField label="Full name" value={fields.name} onChangeText={(value) => update('name', value)} autoComplete="name" />
      <FormField label="Relationship" value={fields.relationship} onChangeText={(value) => update('relationship', value)} />
      <FormField label="Phone number" value={fields.phone} onChangeText={(value) => update('phone', value)} keyboardType="phone-pad" />
      <FormField label="Email (optional)" value={fields.email} onChangeText={(value) => update('email', value)} keyboardType="email-address" autoCapitalize="none" />
      <Option label="Set as primary caregiver" value={fields.isPrimary} onChange={(value) => update('isPrimary', value)} />
      <Option label="Receive medication alerts" value={fields.medicationAlerts} onChange={(value) => update('medicationAlerts', value)} />
      <Option label="Receive missed medication alerts" value={fields.missedMedicationAlerts} onChange={(value) => update('missedMedicationAlerts', value)} />
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
      <ActionButton label={id ? 'Save caregiver' : 'Add caregiver'} loading={isSaving} onPress={() => void save()} />
      <ActionButton label="Cancel" secondary onPress={() => router.back()} />
    </Screen>
  );
}

function Option({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.option}>
      <ThemedText type="smallBold" style={styles.optionLabel}>{label}</ThemedText>
      <Switch value={value} onValueChange={onChange} accessibilityRole="switch" accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', gap: 16, paddingVertical: 40 },
  option: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#777777' },
  optionLabel: { flex: 1 },
  error: { color: '#a22121' },
});