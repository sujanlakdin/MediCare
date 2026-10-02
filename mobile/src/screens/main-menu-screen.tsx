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

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: { ios?: any; android?: string; web?: string };
  badge?: string;
  onPress: () => void;
};

export default function MainMenuScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const { settings: a11y } = useAccessibility();

  // Modal for modules being built by other group members
  const [moduleNotice, setModuleNotice] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({
    visible: false,
    title: '',
    description: '',
  });

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Home & adherence tracking',
      icon: { ios: 'house.fill', android: 'home', web: 'home' },
      onPress: () => router.push('/' as Href),
    },
    {
      id: 'medications',
      title: 'Medications',
      subtitle: 'View your active medications',
      icon: { ios: 'pills.fill', android: 'medication', web: 'medication' },
      onPress: () => {
        // Safe navigation or informative notice
        try {
          router.push('/(tabs)/medications' as unknown as Href);
        } catch {
          setModuleNotice({
            visible: true,
            title: 'Medications Module',
            description:
              'This module manages patient pill schedules and dosages. When your group teammates publish their module, your active prescriptions will display here.',
          });
        }
      },
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'View reminders & upcoming schedule',
      icon: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
      onPress: () => {
        try {
          router.push('/(tabs)/schedule' as unknown as Href);
        } catch {
          setModuleNotice({
            visible: true,
            title: 'Medication Schedule',
            description:
              'View your upcoming morning, noon, and evening dose reminders. Configure your interval preferences in Notification Settings.',
          });
        }
      },
    },
    {
      id: 'adherence',
      title: 'Adherence',
      subtitle: 'Monitor performance & progress',
      icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' },
      onPress: () => {
        try {
          router.push('/(tabs)/adherence' as unknown as Href);
        } catch {
          setModuleNotice({
            visible: true,
            title: 'Adherence Tracker',
            description:
              'Monitor your weekly and monthly compliance scores to keep track of taken versus missed doses.',
          });
        }
      },
    },
    {
      id: 'caregiver',
      title: 'Caregiver',
      subtitle: 'Quick access for emergency helpers',
      icon: { ios: 'heart.text.square.fill', android: 'health_and_safety', web: 'health_and_safety' },
      onPress: () => router.push('/settings/caregivers' as Href),
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'View and manage personal details',
      icon: { ios: 'person.crop.circle.fill', android: 'person', web: 'person' },
      onPress: () => router.push('/profile' as Href),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences & account settings',
      icon: { ios: 'gearshape.fill', android: 'settings', web: 'settings' },
      onPress: () => router.push('/settings' as Href),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help, FAQs & contact help',
      icon: { ios: 'questionmark.circle.fill', android: 'help_outline', web: 'help_outline' },
      onPress: () => router.push('/settings/help' as Href),
    },
  ];

  return (
    <Screen
      title="Main Menu"
      subtitle="Quick access to your medication care"
      simpleSubtitle="Main options">
      {user ? (
        <ThemedView type="backgroundElement" style={styles.patientBanner}>
          <View style={styles.patientAvatar}>
            <ThemedText style={styles.patientAvatarText}>
              {user.fullName.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')}
            </ThemedText>
          </View>
          <View style={styles.patientInfo}>
            <ThemedText type="smallBold" style={styles.patientName}>
              {user.fullName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              MediCare Patient Portal
            </ThemedText>
          </View>
        </ThemedView>
      ) : null}

      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}
            onPress={item.onPress}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
            <ThemedView
              type="backgroundElement"
              style={[
                styles.menuCard,
                a11y.largerButtons && styles.largeMenuCard,
              ]}>
              <View style={styles.iconCircle}>
                <SymbolView name={item.icon} size={24} tintColor="#145c44" />
              </View>

              <View style={styles.textContainer}>
                <ThemedText type="smallBold" style={styles.itemTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.itemSubtitle}>
                  {item.subtitle}
                </ThemedText>
              </View>

              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={20}
                tintColor={theme.textSecondary}
              />
            </ThemedView>
          </Pressable>
        ))}
      </View>

      {/* Notice Modal for upcoming group modules */}
      <Modal
        visible={moduleNotice.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModuleNotice((p) => ({ ...p, visible: false }))}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <SymbolView
                name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
                size={26}
                tintColor="#145c44"
              />
              <ThemedText type="subtitle" style={styles.modalTitle}>
                {moduleNotice.title}
              </ThemedText>
            </View>

            <ThemedText style={styles.modalBody}>
              {moduleNotice.description}
            </ThemedText>

            <ActionButton
              label="Understood"
              onPress={() => setModuleNotice((p) => ({ ...p, visible: false }))}
            />
          </ThemedView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  patientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: Spacing.two,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#145c44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  patientInfo: {
    flex: 1,
    gap: 2,
  },
  patientName: {
    fontSize: 17,
  },
  menuGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  pressable: {
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  menuCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  largeMenuCard: {
    minHeight: 92,
    paddingVertical: Spacing.four,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  itemSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  modalBody: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
  },
});
