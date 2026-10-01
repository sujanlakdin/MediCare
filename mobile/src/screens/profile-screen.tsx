import { Link, router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { Screen, ScreenSection } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { getProfile, type Profile } from '@/services/medicare-api';
import { ApiError } from '@/services/api';

export default function ProfileScreen() {
  const { token } = useAuth();
  const theme = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await getProfile(token);
      setProfile(result.profile);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  return (
    <Screen title="Your profile" subtitle="Your account and contact information">
      {isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" accessibilityLabel="Loading profile" />
          <ThemedText>Loading profile...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <ThemedText accessibilityRole="alert">{error}</ThemedText>
          <ActionButton label="Try again" onPress={() => void loadProfile()} />
        </View>
      ) : profile ? (
        <>
          <View style={styles.identity}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]} accessible accessibilityLabel={`Profile image placeholder for ${profile.fullName}`}>
              <ThemedText type="subtitle" style={styles.initials}>{profile.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')}</ThemedText>
            </View>
            <View style={styles.nameBlock}>
              <ThemedText type="subtitle" style={styles.name}>{profile.fullName}</ThemedText>
              <ThemedText themeColor="textSecondary">{profile.email}</ThemedText>
            </View>
          </View>
          <ScreenSection title="Personal information">
            <ProfileValue label="Phone number" value={profile.phone} />
            <ProfileValue label="Date of birth" value={profile.dateOfBirth} />
            <ProfileValue label="Gender" value={profile.gender} />
            <ProfileValue label="Address" value={profile.address} />
          </ScreenSection>
          <ScreenSection title="Emergency contact">
            <ProfileValue label="Name" value={profile.emergencyContact?.name} />
            <ProfileValue label="Relationship" value={profile.emergencyContact?.relationship} />
            <ProfileValue label="Phone number" value={profile.emergencyContact?.phone} />
          </ScreenSection>
          <ActionButton label="Edit profile" onPress={() => router.push('/profile/edit' as Href)} />
          <Link href={'/settings' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.link}>
              <ThemedText type="smallBold">Settings</ThemedText>
            </Pressable>
          </Link>
          <Link href={'/settings/caregivers' as Href} asChild>
            <Pressable accessibilityRole="button" style={styles.link}>
              <ThemedText type="smallBold">Emergency & caregiver settings</ThemedText>
            </Pressable>
          </Link>
        </>
      ) : null}
    </Screen>
  );
}

function ProfileValue({ label, value }: { label: string; value?: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.valueRow}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText>{value?.trim() || 'Not provided'}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 30, lineHeight: 38 },
  nameBlock: { flex: 1, gap: Spacing.one },
  name: { fontSize: 26, lineHeight: 34 },
  valueRow: { padding: Spacing.three, borderRadius: 8, gap: Spacing.one },
  link: { minHeight: 52, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#737373' },
});