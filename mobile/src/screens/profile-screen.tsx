import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { Screen, ScreenSection } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { getProfile, type Profile } from '@/services/medicare-api';

export default function ProfileScreen() {
  const { token } = useAuth();
  const theme = useTheme();
  const { settings } = useAccessibility();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (isRefresh = false) => {
    if (!token) return;
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');
    try {
      const result = await getProfile(token);
      setProfile(result.profile);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Unable to connect. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  };

  const getDisplayAge = (profileData: Profile) => {
    if (profileData.age !== undefined && profileData.age !== null && profileData.age > 0) {
      return `${profileData.age} years old`;
    }
    if (profileData.dateOfBirth) {
      const birth = new Date(profileData.dateOfBirth);
      if (!isNaN(birth.getTime())) {
        const diffYears = Math.floor(
          (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        );
        if (diffYears > 0 && diffYears < 130) {
          return `${diffYears} years old`;
        }
      }
    }
    return 'Age not specified';
  };

  const getMedicalId = (profileData: Profile) => {
    if (profileData.medicalId?.trim()) return profileData.medicalId.trim();
    if (profileData._id) return `MED-${profileData._id.slice(-6).toUpperCase()}`;
    return 'Not assigned';
  };

  return (
    <Screen
      title="My Profile"
      subtitle="View and manage your personal profile details"
      simpleSubtitle="Your personal details"
      refreshing={isRefreshing}
      onRefresh={() => void loadProfile(true)}>
      {isLoading && !profile ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color="#145c44" accessibilityLabel="Loading profile" />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      ) : error && !profile ? (
        <View style={styles.state}>
          <ThemedText accessibilityRole="alert" style={styles.errorText}>
            {error}
          </ThemedText>
          <ActionButton label="Try again" onPress={() => void loadProfile()} />
        </View>
      ) : profile ? (
        <>
          {/* Profile Card */}
          <ThemedView type="backgroundElement" style={styles.profileCard}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: settings.highContrast ? theme.text : '#145c44' },
              ]}
              accessible
              accessibilityLabel={`Profile avatar for ${profile.fullName}`}>
              <ThemedText style={styles.avatarInitials}>
                {getInitials(profile.fullName)}
              </ThemedText>
            </View>

            <View style={styles.identityDetails}>
              <ThemedText type="subtitle" style={styles.profileName}>
                {profile.fullName}
              </ThemedText>
              <View style={styles.ageBadge}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'event', web: 'calendar_today' }}
                  size={16}
                  tintColor="#145c44"
                />
                <ThemedText style={styles.ageText}>{getDisplayAge(profile)}</ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Information Section */}
          <ScreenSection title="Information">
            <InfoCard
              label="PHONE NUMBER"
              value={profile.phone || 'Not provided'}
              icon={{ ios: 'phone.fill', android: 'phone', web: 'phone' }}
            />
            <InfoCard
              label="EMAIL ADDRESS"
              value={profile.email || 'Not provided'}
              icon={{ ios: 'envelope.fill', android: 'email', web: 'email' }}
            />
            <InfoCard
              label="HOME ADDRESS"
              value={profile.address || 'Not provided'}
              icon={{ ios: 'house.fill', android: 'home', web: 'home' }}
            />
            <InfoCard
              label="MEDICAL ID"
              value={getMedicalId(profile)}
              icon={{ ios: 'cross.case.fill', android: 'medical_services', web: 'medical_services' }}
              highlight
            />
          </ScreenSection>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <ActionButton
              label="Edit Profile Details"
              onPress={() => router.push('/profile/edit' as Href)}
            />
            <ActionButton
              label="Caregiver & Emergency"
              secondary
              onPress={() => router.push('/settings/caregivers' as Href)}
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function InfoCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: { ios?: any; android?: string; web?: string };
  highlight?: boolean;
}) {
  const theme = useTheme();
  const { settings } = useAccessibility();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.infoCard,
        highlight && styles.highlightCard,
        settings.largerButtons && styles.largeInfoCard,
      ]}>
      <View style={styles.infoIconWrapper}>
        <SymbolView name={icon} size={22} tintColor="#145c44" />
      </View>
      <View style={styles.infoContent}>
        <ThemedText type="smallBold" style={styles.infoLabel}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.infoValue, { color: theme.text }]}>
          {value}
        </ThemedText>
      </View>
    </ThemedView>
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
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
  },
  identityDetails: {
    flex: 1,
    gap: Spacing.one,
  },
  profileName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ageText: {
    fontSize: 16,
    color: '#145c44',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: Spacing.three,
  },
  largeInfoCard: {
    minHeight: 76,
    paddingVertical: Spacing.four,
  },
  highlightCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  infoIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
  },
  buttonGroup: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});