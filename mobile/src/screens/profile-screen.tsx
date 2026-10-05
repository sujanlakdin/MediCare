import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { CareIcon } from '@/components/care-icon';
import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';
import { getProfile, type Profile } from '@/services/medicare-api';

const DEFAULT_PROFILE = {
  fullName: 'Chathura Rajapakse',
  age: '72 Years Old',
  phone: '+94 77 123 4567',
  email: 'chathura.r@gmail.com',
  address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
  medicalId: 'MRX-9082-72',
};

export default function ProfileScreen() {
  const { token } = useAuth();
  const { settings } = useAccessibility();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await getProfile(token);
      setProfile(result.profile);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to load profile. Using local details.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Derive display values from profile or fallback to the reference mockup
  const displayName = profile?.fullName?.trim() || DEFAULT_PROFILE.fullName;
  const displayEmail = profile?.email?.trim() || DEFAULT_PROFILE.email;
  const displayPhone = profile?.phone?.trim() || DEFAULT_PROFILE.phone;
  const displayAddress = profile?.address?.trim() || DEFAULT_PROFILE.address;

  // Compute age from dateOfBirth if available, otherwise default to 72 Years Old
  let displayAge = DEFAULT_PROFILE.age;
  if (profile?.dateOfBirth) {
    const birthYear = parseInt(profile.dateOfBirth.split('-')[0], 10);
    if (!isNaN(birthYear) && birthYear > 1900 && birthYear < 2026) {
      displayAge = `${2026 - birthYear} Years Old`;
    }
  }

  const displayMedicalId = profile?._id
    ? `MRX-${profile._id.slice(-4).toUpperCase()}-72`
    : DEFAULT_PROFILE.medicalId;

  return (
    <Screen
      title="My Profile"
      subtitle="View your personal and medical profile details."
      activeTab="profile">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#0E3E2F" accessibilityLabel="Loading profile" />
          <Text style={styles.loadingText}>Loading profile details...</Text>
        </View>
      ) : (
        <>
          {/* Profile Header Block */}
          <View style={styles.identityBlock}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require('@/assets/images/chathura_avatar.jpg')}
                style={styles.avatarImage}
                accessibilityLabel={`Profile image for ${displayName}`}
              />
            </View>
            <Text
              style={[
                styles.nameText,
                settings.fontSize === 'large' && styles.largeNameText,
                settings.fontSize === 'extraLarge' && styles.extraLargeNameText,
              ]}>
              {displayName}
            </Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>{displayAge}</Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            {/* Phone */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="phone" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{displayPhone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="mail" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Address */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="location" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Residential Address</Text>
                <Text style={styles.infoValue}>{displayAddress}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Medical ID */}
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <CareIcon name="medical" size={18} color="#22996E" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Medical ID</Text>
                <Text style={styles.infoValue}>{displayMedicalId}</Text>
              </View>
            </View>
          </View>

          {/* Edit Profile Details Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit Profile Details"
            onPress={() => router.push('/profile/edit' as Href)}
            style={({ pressed }) => [
              styles.editButton,
              settings.largerButtons && styles.largeButton,
              pressed && styles.pressed,
            ]}>
            <CareIcon name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile Details</Text>
          </Pressable>

          {/* Caregiver & Emergency Card */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Caregiver & Emergency"
            onPress={() => router.push('/settings/caregivers' as Href)}
            style={({ pressed }) => [
              styles.caregiverCard,
              settings.largerButtons && styles.largeCaregiverCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.caregiverIconCircle}>
              <CareIcon name="heart" size={18} color="#22996E" />
            </View>
            <Text style={styles.caregiverTitle}>Caregiver & Emergency</Text>
            <CareIcon name="chevron-right" size={18} color="#71827A" />
          </Pressable>
        </>
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
  identityBlock: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: '#E8F6EF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.2,
  },
  largeNameText: {
    fontSize: 25,
  },
  extraLargeNameText: {
    fontSize: 28,
  },
  ageBadge: {
    backgroundColor: '#E7F5EE',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C6E7D6',
  },
  ageBadgeText: {
    color: '#1B7D54',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    paddingHorizontal: 16,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#71827A',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1C2A24',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
  },
  editButton: {
    backgroundColor: '#0E3E2F',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 2,
    shadowColor: '#0E3E2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  largeButton: {
    height: 62,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  caregiverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 58,
    gap: 12,
  },
  largeCaregiverCard: {
    height: 68,
  },
  caregiverIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F6EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caregiverTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  pressed: {
    opacity: 0.8,
  },
});