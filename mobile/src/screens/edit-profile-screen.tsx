import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { getProfile, updateProfile } from '@/services/medicare-api';

type FormState = {
  fullName: string;
  age: string;
  phone: string;
  email: string;
  address: string;
  medicalId: string;
};

type FormErrors = {
  fullName?: string;
  age?: string;
  phone?: string;
  email?: string;
  address?: string;
  general?: string;
};

export default function EditProfileScreen() {
  const { token } = useAuth();
  const [fields, setFields] = useState<FormState>({
    fullName: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    medicalId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrors({});
    try {
      const result = await getProfile(token);
      const p = result.profile;
      setFields({
        fullName: p.fullName || '',
        age: p.age !== undefined && p.age !== null ? String(p.age) : '',
        phone: p.phone || '',
        email: p.email || '',
        address: p.address || '',
        medicalId: p.medicalId || '',
      });
    } catch (requestError) {
      setErrors({
        general:
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to load profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function handleChange(key: keyof FormState, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
    setSuccessMessage('');
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    // Full name validation
    if (!fields.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    } else if (fields.fullName.trim().length < 2) {
      nextErrors.fullName = 'Full name must be at least 2 characters.';
    }

    // Age validation
    if (!fields.age.trim()) {
      nextErrors.age = 'Age is required.';
    } else {
      const ageNum = Number(fields.age.trim());
      if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 130) {
        nextErrors.age = 'Please enter a valid age (e.g. 72).';
      }
    }

    // Phone validation
    const digitsOnly = fields.phone.replace(/\D/g, '');
    if (!fields.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      nextErrors.phone = 'Please enter a valid phone number (at least 7 digits).';
    }

    // Email validation
    if (!fields.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    // Address validation
    if (!fields.address.trim()) {
      nextErrors.address = 'Residential address is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!token) return;
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await updateProfile(token, {
        fullName: fields.fullName.trim(),
        age: parseInt(fields.age.trim(), 10),
        phone: fields.phone.trim(),
        email: fields.email.trim().toLowerCase(),
        address: fields.address.trim(),
        medicalId: fields.medicalId.trim(),
      });

      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => {
        router.back();
      }, 700);
    } catch (requestError) {
      setErrors({
        general:
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to update profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Edit Profile" subtitle="Keep your contact and personal details up to date">
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#145c44" />
          <ThemedText style={styles.loadingText}>Loading current details...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Edit Profile"
      subtitle="Keep your contact and personal details up to date"
      simpleSubtitle="Update your information">
      {successMessage ? (
        <View style={styles.successBanner} accessibilityRole="alert">
          <ThemedText style={styles.successText}>✓ {successMessage}</ThemedText>
        </View>
      ) : null}

      {errors.general ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <ThemedText style={styles.errorBannerText}>{errors.general}</ThemedText>
        </View>
      ) : null}

      <View style={styles.form}>
        <FormField
          label="FULL NAME"
          value={fields.fullName}
          onChangeText={(val) => handleChange('fullName', val)}
          placeholder="e.g. Eleanor Vance"
          error={errors.fullName}
          autoComplete="name"
        />

        <FormField
          label="AGE"
          value={fields.age}
          onChangeText={(val) => handleChange('age', val)}
          placeholder="e.g. 72"
          keyboardType="numeric"
          error={errors.age}
        />

        <FormField
          label="PHONE NUMBER"
          value={fields.phone}
          onChangeText={(val) => handleChange('phone', val)}
          placeholder="e.g. +1 555-0192"
          keyboardType="phone-pad"
          error={errors.phone}
          autoComplete="tel"
        />

        <FormField
          label="EMAIL ADDRESS"
          value={fields.email}
          onChangeText={(val) => handleChange('email', val)}
          placeholder="e.g. eleanor@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          autoComplete="email"
        />

        <FormField
          label="RESIDENTIAL ADDRESS"
          value={fields.address}
          onChangeText={(val) => handleChange('address', val)}
          placeholder="e.g. 42 Maple Street, Apt 3B, Springfield"
          multiline
          numberOfLines={3}
          style={styles.addressInput}
          error={errors.address}
          autoComplete="street-address"
        />

        <FormField
          label="MEDICAL ID (OPTIONAL)"
          value={fields.medicalId}
          onChangeText={(val) => handleChange('medicalId', val)}
          placeholder="e.g. MED-88239"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.buttonGroup}>
        <ActionButton
          label={isSaving ? 'Saving Changes...' : 'Save Changes'}
          loading={isSaving}
          onPress={() => void handleSave()}
        />
        <ActionButton
          label="Cancel"
          secondary
          disabled={isSaving}
          onPress={() => router.back()}
        />
      </View>
    </Screen>
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
  form: {
    gap: Spacing.three,
  },
  addressInput: {
    minHeight: 84,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonGroup: {
    gap: Spacing.three,
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
  },
  errorBannerText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 15,
  },
});