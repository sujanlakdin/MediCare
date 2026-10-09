import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
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
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    if (!token) {
      setError('Please sign in to manage caregiver details.');
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
            setError('Caregiver not found. Please return and refresh the caregiver list.');
          } else {
            setName(found.name);
            setPhone(found.phone);
            setRelationship(found.relationship);
            setEmail(found.email || '');
          }
        } else if (caregivers.length > 0) {
          Alert.alert(
            'Caregiver already registered',
            'Your existing caregiver details are available on the Caregiver and Emergency page.',
            [{ text: 'OK', onPress: () => router.replace('/settings/caregivers' as Href) }]
          );
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
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

  async function handleSave() {
    if (!name.trim()) {
      setError('Please enter the caregiver’s full name.');
      return;
    }
    if (!relationship.trim()) {
      setError('Please enter the caregiver’s relationship to you.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Please enter a valid caregiver phone number.');
      return;
    }
    if (email.trim() && !isValidEmail(email.trim())) {
      setError('Please enter a valid caregiver email address.');
      return;
    }

    if (!token) {
      setError('Please sign in to save caregiver details.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (id) {
        await updateCaregiver(token, id, {
          name: name.trim(),
          phone: phone.trim(),
          relationship: relationship.trim(),
          email: email.trim(),
        });
      } else {
        await createCaregiver(token, {
          name: name.trim(),
          phone: phone.trim(),
          relationship: relationship.trim(),
          email: email.trim(),
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
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to save caregiver. Please try again.'
      );
    } finally {
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
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#9CB0A6"
              autoComplete="name"
            />
          </View>

          {/* PHONE NUMBER */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor="#9CB0A6"
              keyboardType="phone-pad"
            />
          </View>

          {/* RELATIONSHIP */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>RELATIONSHIP</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="Relationship (e.g. Daughter, Spouse)"
              placeholderTextColor="#9CB0A6"
            />
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, a11y.largerButtons && styles.largeInput]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#9CB0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Info Notice Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              Your caregiver will receive critical notifications if you miss a dose
              or when help is requested.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

function isValidPhone(value: string) {
  const phone = value.trim();
  const digits = phone.replace(/\D/g, '');
  return /^\+?[\d().\s-]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}