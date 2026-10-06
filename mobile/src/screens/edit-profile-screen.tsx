import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

  const loadProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const result = await getProfile(token);
      const p = result.profile;
      if (p.fullName) setFullName(p.fullName);
      if (p.email) setEmail(p.email);
      if (p.phone) setPhone(p.phone);
      if (p.address) setAddress(p.address);
      if (p.dateOfBirth) {
        const year = parseInt(p.dateOfBirth.split('-')[0], 10);
        if (!isNaN(year)) {
          setAge(String(2026 - year));
        }
      }
    } catch {
      // Keep defaults
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  async function handleSave() {
    if (!fullName.trim() || !email.trim()) {
      setError('Please enter your full name and a valid email address.');
      return;
    }

    setIsSaving(true);
    setError('');

    // Compute date of birth from age
    const numericAge = parseInt(age.trim(), 10);
    const birthYear = !isNaN(numericAge) && numericAge > 0 ? 2026 - numericAge : 1954;
    const dateOfBirth = `${birthYear}-01-01`;

    try {
      if (token) {
        await updateProfile(token, {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          dateOfBirth,
        });
      }
      router.replace('/profile' as Href);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to update profile. Please try again.'
      );
    } finally {
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
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor="#9CB0A6"
              autoComplete="name"
            />
          </View>

          {/* AGE */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>AGE</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="#9CB0A6"
              keyboardType="number-pad"
            />
          </View>

          {/* PHONE NUMBER */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              placeholderTextColor="#9CB0A6"
              keyboardType="phone-pad"
            />
          </View>

          {/* EMAIL ADDRESS */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.input, settings.largerButtons && styles.largeInput]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              placeholderTextColor="#9CB0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
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
              onChangeText={setAddress}
              placeholder="Residential Address"
              placeholderTextColor="#9CB0A6"
              multiline
              numberOfLines={2}
            />
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