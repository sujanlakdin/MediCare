import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { getProfile, updateProfile, type Profile } from '@/services/medicare-api';

type Fields = Pick<Profile, 'fullName' | 'email' | 'phone' | 'dateOfBirth' | 'gender' | 'address'>;

export default function EditProfileScreen() {
  const { token } = useAuth();
  const [fields, setFields] = useState<Fields>({ fullName: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getProfile(token);
      const { fullName, email, phone, dateOfBirth, gender, address } = result.profile;
      setFields({ fullName, email, phone, dateOfBirth, gender, address });
      setError('');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  function change(key: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setFieldError('');
    setMessage('');
  }

  async function save() {
    if (!token) return;
    if (!fields.fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      setFieldError('Enter your name and a valid email address.');
      return;
    }
    if (fields.phone && fields.phone.replace(/\D/g, '').length < 7) {
      setFieldError('Enter a valid phone number or leave it blank.');
      return;
    }
    setIsSaving(true);
    setFieldError('');
    setError('');
    try {
      await updateProfile(token, fields);
      setMessage('Profile updated successfully.');
      router.replace('/profile' as Href);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Screen title="Edit profile"><View style={styles.state}><ActivityIndicator size="large" /><ThemedText>Loading profile...</ThemedText></View></Screen>;
  }
  if (error && !fields.email) {
    return <Screen title="Edit profile"><ThemedText accessibilityRole="alert">{error}</ThemedText><ActionButton label="Try again" onPress={() => { setIsLoading(true); void loadProfile(); }} /></Screen>;
  }

  return (
    <Screen title="Edit profile" subtitle="Update your personal information">
      <FormField label="Full name" value={fields.fullName} onChangeText={(value) => change('fullName', value)} autoComplete="name" />
      <FormField label="Email" value={fields.email} onChangeText={(value) => change('email', value)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <FormField label="Phone number" value={fields.phone} onChangeText={(value) => change('phone', value)} keyboardType="phone-pad" />
      <FormField label="Date of birth (YYYY-MM-DD)" value={fields.dateOfBirth} onChangeText={(value) => change('dateOfBirth', value)} placeholder="YYYY-MM-DD" />
      <FormField label="Gender" value={fields.gender} onChangeText={(value) => change('gender', value)} />
      <FormField label="Address" value={fields.address} onChangeText={(value) => change('address', value)} multiline />
      {fieldError ? <ThemedText accessibilityRole="alert" style={styles.error}>{fieldError}</ThemedText> : null}
      {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
      {message ? <ThemedText accessibilityRole="alert">{message}</ThemedText> : null}
      <ActionButton label="Save changes" loading={isSaving} onPress={() => void save()} />
      <ActionButton label="Cancel" secondary onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  error: { color: '#a22121' },
});