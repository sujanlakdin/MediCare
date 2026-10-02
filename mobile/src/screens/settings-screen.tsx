import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { ActionButton } from '@/components/action-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const theme = useTheme();
  const { settings } = useAccessibility();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  function handleLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of MediCare on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            void signOut().then(() => {
              router.replace('/sign-in' as Href);
            });
          },
        },
      ]
    );
  }

  return (
    <Screen
      title="Settings"
      subtitle="Control and configure your application"
      simpleSubtitle="Application settings">
      {user ? (
        <ThemedView type="backgroundElement" style={styles.userBadge}>
          <SymbolView
            name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
            size={28}
            tintColor="#145c44"
          />
          <View style={styles.userBadgeText}>
            <ThemedText type="smallBold">{user.fullName}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user.email}
            </ThemedText>
          </View>
        </ThemedView>
      ) : null}

      <View style={styles.list}>
        <SettingItem
          title="Profile Settings"
          subtitle="Manage personal and contact details"
          icon={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
          onPress={() => router.push('/profile' as Href)}
        />

        <SettingItem
          title="Notification Settings"
          subtitle="Configure reminder preferences"
          icon={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' }}
          onPress={() => router.push('/settings/notifications' as Href)}
        />

        <SettingItem
          title="Accessibility Options"
          subtitle="Adjust display and touch assist"
          icon={{ ios: 'figure.stand', android: 'accessibility', web: 'accessibility' }}
          onPress={() => router.push('/settings/accessibility' as Href)}
        />

        <SettingItem
          title="Emergency & Caregiver"
          subtitle="Manage who can support you in an emergency"
          icon={{ ios: 'heart.text.square.fill', android: 'health_and_safety', web: 'health_and_safety' }}
          onPress={() => router.push('/settings/caregivers' as Href)}
        />

        <SettingItem
          title="Privacy & Data Protection"
          subtitle="Encrypted medical records & data privacy"
          icon={{ ios: 'lock.shield.fill', android: 'security', web: 'security' }}
          onPress={() => setShowPrivacyModal(true)}
        />

        <SettingItem
          title="Help & Support"
          subtitle="Get help with your MediCare app"
          icon={{ ios: 'questionmark.circle.fill', android: 'help_outline', web: 'help_outline' }}
          onPress={() => router.push('/settings/help' as Href)}
        />
      </View>

      <View style={styles.logoutContainer}>
        <ActionButton
          label="Logout"
          destructive
          onPress={handleLogout}
        />
      </View>

      {/* Privacy & Data Protection Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyModal(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <SymbolView
                  name={{ ios: 'lock.shield.fill', android: 'security', web: 'security' }}
                  size={24}
                  tintColor="#145c44"
                />
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Privacy & Data
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close privacy information"
                onPress={() => setShowPrivacyModal(false)}
                style={styles.closeButton}>
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <PrivacyBlock
                title="End-to-End Account Security"
                description="Your MediCare credentials and medical profile are protected using salted password hashing (bcrypt) and signed JWT authentication."
              />
              <PrivacyBlock
                title="Strict Medical Privacy"
                description="Only you and your explicitly authorized linked caregivers can view your medication schedule and adherence statistics."
              />
              <PrivacyBlock
                title="Elderly Patient Protection"
                description="Emergency SOS notifications and caregiver synchronization only send data when you request or if critical doses are missed."
              />
              <PrivacyBlock
                title="Data Retention & Deletion"
                description="You have full ownership of your records. You can update or remove linked caregivers and profile details at any time."
              />
            </ScrollView>

            <ActionButton
              label="Done"
              onPress={() => setShowPrivacyModal(false)}
            />
          </ThemedView>
        </View>
      </Modal>
    </Screen>
  );
}

function SettingItem({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: { ios?: any; android?: string; web?: string };
  onPress: () => void;
}) {
  const theme = useTheme();
  const { settings } = useAccessibility();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <ThemedView
        type="backgroundElement"
        style={[styles.row, settings.largerButtons && styles.largeRow]}>
        <View style={styles.iconContainer}>
          <SymbolView name={icon} size={24} tintColor="#145c44" />
        </View>

        <View style={styles.copy}>
          <ThemedText type="smallBold" style={styles.itemTitle}>
            {title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>

        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={20}
          tintColor={theme.textSecondary}
        />
      </ThemedView>
    </Pressable>
  );
}

function PrivacyBlock({ title, description }: { title: string; description: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.privacyCard}>
      <ThemedText type="smallBold" style={styles.privacyCardTitle}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.privacyCardDesc}>
        {description}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: Spacing.two,
  },
  userBadgeText: {
    flex: 1,
    gap: 2,
  },
  list: {
    gap: Spacing.two,
  },
  pressable: {
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  row: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  largeRow: {
    minHeight: 88,
    paddingVertical: Spacing.four,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  logoutContainer: {
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    maxHeight: '85%',
    gap: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  closeButton: {
    padding: Spacing.two,
  },
  closeButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6b7280',
  },
  modalScroll: {
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  privacyCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  privacyCardTitle: {
    fontSize: 16,
    color: '#145c44',
  },
  privacyCardDesc: {
    lineHeight: 20,
  },
});