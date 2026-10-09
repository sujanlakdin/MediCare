import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { getProfile, updateProfile } from '@/services/medicare-api';

type ProfileField = 'fullName' | 'age' | 'phone' | 'email' | 'address';
type ProfileFieldErrors = Partial<Record<ProfileField, string>>;

export default function EditProfileScreen() {
  const { token } = useAuth();
  const { settings } = useAccessibility();

  const [fullName, setFullName] = useState('Chathura Rajapakse');
  const [age, setAge] = useState('72');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [email, setEmail] = useState('chathura.r@gmail.com');
  const [address, setAddress] = useState(
    'No. 45, Galle Road, Colombo 03, Sri Lanka'
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const savingRef = useRef(false);

  useEffect(() => {
    let active = true;
    if (!token) {
      void Promise.resolve().then(() => {
        if (!active) return;
        setError('Please sign in to update your profile.');
        setIsLoading(false);
      });
      return () => {
        active = false;
      };
    }

    void getProfile(token)
      .then(({ profile: p }) => {
        if (!active) return;
        if (p.fullName) setFullName(p.fullName);
        if (p.email) setEmail(p.email);
        if (p.phone) setPhone(p.phone);
        if (p.address) setAddress(p.address);
        if (p.dateOfBirth) {
          const year = parseInt(p.dateOfBirth.split('-')[0], 10);
          if (!isNaN(year)) setAge(String(new Date().getFullYear() - year));
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to load profile details. Please try again.'
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  function handleFieldChange(field: ProfileField, value: string) {
    if (field === 'fullName') setFullName(value);
    if (field === 'age') setAge(value);
    if (field === 'phone') setPhone(value);
    if (field === 'email') setEmail(value);
    if (field === 'address') setAddress(value);
    const validationError = getProfileFieldError(field, value);
    setFieldErrors((current) => {
      if (!current[field]) return current;
      if (validationError) return { ...current, [field]: validationError };
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSave() {
    if (savingRef.current) return;

    const trimmedName = fullName.trim();
    const trimmedAge = age.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();
    const nextErrors: ProfileFieldErrors = {};

    for (const field of ['fullName', 'age', 'phone', 'email', 'address'] as const) {
      const value = field === 'fullName'
        ? trimmedName
        : field === 'age'
          ? trimmedAge
          : field === 'phone'
            ? trimmedPhone
            : field === 'email'
              ? trimmedEmail
              : trimmedAddress;
      const validationError = getProfileFieldError(field, value);
      if (validationError) nextErrors[field] = validationError;
    }
    setFieldErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length > 0) return;

    if (!token) {
      setError('Please sign in to update your profile.');
      return;
    }

    setIsSaving(true);
    savingRef.current = true;
    setError('');

    // Compute date of birth from age
    const numericAge = Number(trimmedAge);
    const dateOfBirth = trimmedAge
      ? `${new Date().getFullYear() - numericAge}-01-01`
      : '';

    try {
      await updateProfile(token, {
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        address: trimmedAddress,
        dateOfBirth,
      });
      router.replace('/(app)/(tabs)/profile' as Href);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to update profile. Please try again.'
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Screen
      title="Edit Profile"
      subtitle="Keep your contact and address details up to date."
      showBack={true}
      activeTab="profile">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" />
          <Text style={styles.loadingText}>Loading profile details...</Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          {/* FULL NAME */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={fullName}
              onChangeText={(value) => handleFieldChange('fullName', value)}
              placeholder="Full Name"
              placeholderTextColor="#9CB0A6"
              autoComplete="name"
            />
            {fieldErrors.fullName ? <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text> : null}
          </View>

          {/* AGE */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>AGE</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={age}
              onChangeText={(value) => handleFieldChange('age', value)}
              placeholder="Age"
              placeholderTextColor="#9CB0A6"
              keyboardType="number-pad"
            />
            {fieldErrors.age ? <Text style={styles.fieldErrorText}>{fieldErrors.age}</Text> : null}
          </View>

          {/* PHONE NUMBER */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              placeholder="Phone Number"
              placeholderTextColor="#9CB0A6"
              keyboardType="phone-pad"
            />
            {fieldErrors.phone ? <Text style={styles.fieldErrorText}>{fieldErrors.phone}</Text> : null}
          </View>

          {/* EMAIL ADDRESS */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={email}
              onChangeText={(value) => handleFieldChange('email', value)}
              placeholder="Email Address"
              placeholderTextColor="#9CB0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {fieldErrors.email ? <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text> : null}
          </View>

          {/* RESIDENTIAL ADDRESS */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>RESIDENTIAL ADDRESS</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                settings.largerButtons && styles.largeTextArea,
              ]}
              value={address}
              onChangeText={(value) => handleFieldChange('address', value)}
              placeholder="Residential Address"
              placeholderTextColor="#9CB0A6"
              multiline
              numberOfLines={2}
            />
            {fieldErrors.address ? <Text style={styles.fieldErrorText}>{fieldErrors.address}</Text> : null}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
              disabled={isSaving}
              onPress={() => void handleSave()}
              style={({ pressed }) => [
                styles.saveButton,
                settings.largerButtons && styles.largeSaveButton,
                pressed && styles.pressed,
                isSaving && styles.disabled,
              ]}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.cancelButton,
                settings.largerButtons && styles.largeCancelButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}

function getProfileFieldError(field: ProfileField, value: string) {
  const trimmedValue = value.trim();
  if (field === 'fullName') {
    if (!trimmedValue) return 'Enter your full name.';
    if (trimmedValue.length > 120 || !/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(trimmedValue)) {
      return 'Enter a valid name (up to 120 characters; letters, spaces, apostrophes, periods, or hyphens).';
    }
  }
  if (field === 'email') {
    if (!trimmedValue) return 'Enter your email address.';
    if (trimmedValue.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return 'Enter a valid email address (up to 254 characters).';
    }
  }
  if (field === 'age' && trimmedValue && (
    !/^\d+$/.test(trimmedValue) || Number(trimmedValue) < 1 || Number(trimmedValue) > 125
  )) {
    return 'Enter a whole-number age between 1 and 125, or leave it blank.';
  }
  if (field === 'phone' && trimmedValue) {
    const digits = trimmedValue.replace(/\D/g, '');
    if (
      trimmedValue.length > 30 ||
      !/^\+?[\d().\s-]+$/.test(trimmedValue) ||
      digits.length < 7 ||
      digits.length > 15
    ) {
      return 'Enter a valid phone number with 7–15 digits, or leave it blank.';
    }
  }
  if (field === 'address' && trimmedValue.length > 300) {
    return 'Residential address must be 300 characters or fewer.';
  }
  return '';
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
  formContainer: {
    gap: 14,
    paddingTop: 4,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A6054',
    letterSpacing: 0.6,
  },
  input: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE7E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1C2A24',
    fontWeight: '500',
  },
  largeInput: {
    minHeight: 58,
    fontSize: 17,
  },
  textArea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 80,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
  },
  fieldErrorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonGroup: {
    gap: 10,
    marginTop: 8,
    paddingBottom: 16,
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
  },
  largeSaveButton: {
    height: 62,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#22996E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeCancelButton: {
    height: 60,
  },
  cancelButtonText: {
    color: '#22996E',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
});