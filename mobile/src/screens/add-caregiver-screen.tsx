import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { FormField } from '@/components/form-field';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import {
  createCaregiver,
  getCaregivers,
  updateCaregiver,
} from '@/services/medicare-api';

type CaregiverFormState = {
  name: string;
  phone: string;
  relationship: string;
  email: string;
  isPrimary: boolean;
  medicationAlerts: boolean;
  dailyAdherenceSummary: boolean;
  active: boolean;
};

type FormErrors = {
  name?: string;
  phone?: string;
  relationship?: string;
  general?: string;
};

export default function AddCaregiverScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const { token } = useAuth();
  const theme = useTheme();

  const [fields, setFields] = useState<CaregiverFormState>({
    name: '',
    phone: '',
    relationship: '',
    email: '',
    isPrimary: false,
    medicationAlerts: true,
    dailyAdherenceSummary: true,
    active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!id || !token) return;
    let active = true;

    void getCaregivers(token)
      .then(({ caregivers }) => {
        const found = caregivers.find((c) => c._id === id);
        if (!found) throw new Error('Caregiver not found.');
        if (active) {
          setFields({
            name: found.name || '',
            phone: found.phone || '',
            relationship: found.relationship || '',
            email: found.email || '',
            isPrimary: Boolean(found.isPrimary),
            medicationAlerts: found.medicationAlerts ?? true,
            dailyAdherenceSummary: found.dailyAdherenceSummary ?? true,
            active: found.active ?? true,
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setErrors({
            general:
              requestError instanceof ApiError
                ? requestError.message
                : 'Unable to load caregiver details.',
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, token]);

  function handleChange(key: keyof CaregiverFormState, value: unknown) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
    setSuccessMessage('');
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!fields.name.trim()) {
      nextErrors.name = 'Full name is required.';
    } else if (fields.name.trim().length < 2) {
      nextErrors.name = 'Full name must be at least 2 characters.';
    }

    const digitsOnly = fields.phone.replace(/\D/g, '');
    if (!fields.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      nextErrors.phone = 'Enter a valid phone number (at least 7 digits).';
    }

    if (!fields.relationship.trim()) {
      nextErrors.relationship = 'Relationship is required (e.g. Daughter, Nurse).';
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
      const payload = {
        name: fields.name.trim(),
        phone: fields.phone.trim(),
        relationship: fields.relationship.trim(),
        email: fields.email.trim().toLowerCase(),
        isPrimary: fields.isPrimary,
        medicationAlerts: fields.medicationAlerts,
        dailyAdherenceSummary: fields.dailyAdherenceSummary,
        active: fields.active,
      };

      if (id) {
        await updateCaregiver(token, id, payload);
        setSuccessMessage('Caregiver details updated.');
      } else {
        await createCaregiver(token, payload);
        setSuccessMessage('Caregiver linked successfully.');
      }

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (requestError) {
      setErrors({
        general:
          requestError instanceof ApiError
            ? requestError.message
            : 'Unable to save caregiver. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Add Caregiver" subtitle="Link a trusted person to help you">
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#145c44" />
          <ThemedText style={styles.loadingText}>Loading caregiver...</ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title={isEditing ? 'Edit Caregiver' : 'Add Caregiver'}
      subtitle="Link a trusted person to help you"
      simpleSubtitle="Add a helper">
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

      {/* Information Banner */}
      <ThemedView type="backgroundElement" style={styles.infoBanner}>
        <SymbolView
          name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
          size={24}
          tintColor="#145c44"
        />
        <ThemedText style={styles.infoBannerText}>
          Your caregiver will receive critical notifications if you miss a dose or when help is required.
        </ThemedText>
      </ThemedView>

      {/* Fields */}
      <View style={styles.form}>
        <FormField
          label="FULL NAME"
          value={fields.name}
          onChangeText={(val) => handleChange('name', val)}
          placeholder="e.g. Sarah Jenkins"
          error={errors.name}
          autoComplete="name"
        />

        <FormField
          label="PHONE NUMBER"
          value={fields.phone}
          onChangeText={(val) => handleChange('phone', val)}
          placeholder="e.g. +1 555-0144"
          keyboardType="phone-pad"
          error={errors.phone}
          autoComplete="tel"
        />

        <FormField
          label="RELATIONSHIP"
          value={fields.relationship}
          onChangeText={(val) => handleChange('relationship', val)}
          placeholder="e.g. Daughter, Son, Neighbor, Care Nurse"
          error={errors.relationship}
        />

        <FormField
          label="EMAIL ADDRESS (OPTIONAL)"
          value={fields.email}
          onChangeText={(val) => handleChange('email', val)}
          placeholder="e.g. sarah.jenkins@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      {/* Additional Preferences */}
      <ThemedView type="backgroundElement" style={styles.preferencesCard}>
        <ThemedText type="smallBold" style={styles.prefSectionHeader}>
          Caregiver Permissions
        </ThemedText>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <ThemedText type="smallBold">Medication Dose SMS Alerts</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Send SMS when doses are taken or missed
            </ThemedText>
          </View>
          <Switch
            value={fields.medicationAlerts}
            onValueChange={(val) => handleChange('medicationAlerts', val)}
            accessibilityRole="switch"
            accessibilityLabel="Medication Dose SMS Alerts"
            trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <ThemedText type="smallBold">Daily Adherence Summary</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Receive daily medication compliance reports
            </ThemedText>
          </View>
          <Switch
            value={fields.dailyAdherenceSummary}
            onValueChange={(val) => handleChange('dailyAdherenceSummary', val)}
            accessibilityRole="switch"
            accessibilityLabel="Daily Adherence Summary"
            trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <ThemedText type="smallBold">Set as Primary Caregiver</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              First contact in emergency medical situations
            </ThemedText>
          </View>
          <Switch
            value={fields.isPrimary}
            onValueChange={(val) => handleChange('isPrimary', val)}
            accessibilityRole="switch"
            accessibilityLabel="Set as Primary Caregiver"
            trackColor={{ true: '#145c44', false: theme.backgroundSelected }}
            thumbColor="#ffffff"
          />
        </View>
      </ThemedView>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <ActionButton
          label={isSaving ? 'Saving Caregiver...' : 'Save Caregiver'}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    fontWeight: '500',
  },
  form: {
    gap: Spacing.three,
  },
  preferencesCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  prefSectionHeader: {
    fontSize: 13,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  switchCopy: {
    flex: 1,
    gap: 2,
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