import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
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
import {
  createCaregiver,
  getCaregivers,
  updateCaregiver,
} from '@/services/medicare-api';

type CaregiverField = 'name' | 'relationship' | 'phone' | 'email';
type CaregiverFieldErrors = Partial<Record<CaregiverField, string>>;

export default function AddCaregiverScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { token } = useAuth();
  const { settings: a11y } = useAccessibility();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CaregiverFieldErrors>({});
  const savingRef = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setIsLoading(true);
    setFormError('');
    setFieldErrors({});

    if (!token) {
      setFormError('Please sign in to manage caregiver details.');
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    void getCaregivers(token)
      .then(({ caregivers }) => {
        if (!active) return;
        if (id) {
          const found = caregivers.find((item) => item._id === id);
          if (!found) {
            setFormError('Caregiver not found. Please return and refresh the caregiver list.');
          } else {
            setName(found.name);
            setPhone(found.phone);
            setRelationship(found.relationship);
            setEmail(found.email || '');
          }
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setFormError(
            requestError instanceof ApiError
              ? requestError.message
              : 'Unable to load caregiver details. Please try again.'
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, token]));

  function handleFieldChange(field: CaregiverField, value: string) {
    if (field === 'name') setName(value);
    if (field === 'relationship') setRelationship(value);
    if (field === 'phone') setPhone(value);
    if (field === 'email') setEmail(value);
    const validationError = getCaregiverFieldError(field, value);
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

    const trimmedName = name.trim();
    const trimmedRelationship = relationship.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const nextErrors: CaregiverFieldErrors = {};

    for (const field of ['name', 'relationship', 'phone', 'email'] as const) {
      const value = field === 'name'
        ? trimmedName
        : field === 'relationship'
          ? trimmedRelationship
          : field === 'phone'
            ? trimmedPhone
            : trimmedEmail;
      const validationError = getCaregiverFieldError(field, value);
      if (validationError) nextErrors[field] = validationError;
    }
    setFieldErrors(nextErrors);
    setFormError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!token) {
      setFormError('Please sign in to save caregiver details.');
      return;
    }

    setIsSaving(true);
    savingRef.current = true;

    try {
      if (id) {
        await updateCaregiver(token, id, {
          name: trimmedName,
          phone: trimmedPhone,
          relationship: trimmedRelationship,
          email: trimmedEmail,
        });
      } else {
        await createCaregiver(token, {
          name: trimmedName,
          phone: trimmedPhone,
          relationship: trimmedRelationship,
          email: trimmedEmail,
          isPrimary: true,
          medicationAlerts: true,
          missedMedicationAlerts: true,
        });
      }
      Alert.alert(
        'Caregiver saved',
        'Caregiver details have been saved successfully.',
        [{ text: 'OK', onPress: () => router.replace('/settings/caregivers' as Href) }]
      );
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Unable to save caregiver. Please try again.'
      );
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Screen
      title={id ? 'Edit Caregiver' : 'Add Caregiver'}
      subtitle="Link a trusted helper to sync alerts"
      showBack={true}
      patientTab="settings"
      hideBottomNav={false}>
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" />
          <Text style={styles.loadingText}>Loading caregiver details...</Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          {/* FULL NAME */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
              value={name}
              onChangeText={(value) => handleFieldChange('name', value)}
              placeholder="Full Name"
              placeholderTextColor="#9CB0A6"
              autoComplete="name"
            />
            {fieldErrors.name ? <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text> : null}
          </View>

          {/* PHONE NUMBER */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
              value={phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              placeholder="Phone Number"
              placeholderTextColor="#9CB0A6"
              keyboardType="phone-pad"
            />
            {fieldErrors.phone ? <Text style={styles.fieldErrorText}>{fieldErrors.phone}</Text> : null}
          </View>

          {/* RELATIONSHIP */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>RELATIONSHIP</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
              value={relationship}
              onChangeText={(value) => handleFieldChange('relationship', value)}
              placeholder="Relationship (e.g. Daughter, Spouse)"
              placeholderTextColor="#9CB0A6"
            />
            {fieldErrors.relationship ? <Text style={styles.fieldErrorText}>{fieldErrors.relationship}</Text> : null}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
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

          {/* Info Notice Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              Your caregiver will receive critical notifications if you miss a dose
              or when help is requested.
            </Text>
          </View>

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save Caregiver"
              disabled={isSaving}
              onPress={() => void handleSave()}
              style={({ pressed }) => [
                styles.saveButton,
                a11y.largerButtons && styles.largeSaveButton,
                pressed && styles.pressed,
                isSaving && styles.disabled,
              ]}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Caregiver</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.cancelButton,
                a11y.largerButtons && styles.largeCancelButton,
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
  infoBox: {
    backgroundColor: '#E8F6EF',
    borderWidth: 1,
    borderColor: '#C6E7D6',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1A6343',
    lineHeight: 18,
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

function getCaregiverFieldError(field: CaregiverField, value: string) {
  const trimmedValue = value.trim();
  if (field === 'name') {
    if (!trimmedValue) return 'Enter the caregiver’s full name.';
    if (trimmedValue.length > 120 || !/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(trimmedValue)) {
      return 'Enter a valid name (up to 120 characters; letters, spaces, apostrophes, periods, or hyphens).';
    }
  }
  if (field === 'relationship') {
    if (!trimmedValue) return 'Enter the caregiver’s relationship to you.';
    if (trimmedValue.length > 80) return 'Relationship must be 80 characters or fewer.';
  }
  if (field === 'phone') {
    const digits = trimmedValue.replace(/\D/g, '');
    if (
      trimmedValue.length > 30 ||
      !/^\+?[\d().\s-]+$/.test(trimmedValue) ||
      digits.length < 7 ||
      digits.length > 15
    ) {
      return 'Enter a valid phone number with 7–15 digits.';
    }
  }
  if (field === 'email' && trimmedValue && (
    trimmedValue.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
  )) {
    return 'Enter a valid email address (up to 254 characters).';
  }
  return '';
}