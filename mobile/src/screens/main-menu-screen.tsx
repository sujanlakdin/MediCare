import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CareIcon, type CareIconName } from '@/components/care-icon';
import { Screen } from '@/components/screen';
import { useAccessibility } from '@/contexts/accessibility-context';
import { useAuth } from '@/contexts/auth-context';

type MenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: CareIconName;
  onPress: () => void;
};

export default function MainMenuScreen() {
  const { user } = useAuth();
  const { settings: a11y } = useAccessibility();

  const patientName = user?.fullName || 'Chathura Rajapakse';

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Main health & adherence tracking',
      icon: 'dashboard',
      onPress: () => router.push('/(patient)/dashboard' as Href),
    },
    {
      id: 'medications',
      title: 'Medications',
      subtitle: 'View your active medications',
      icon: 'pharmacist',
      onPress: () => router.push('/(patient)/medications' as Href),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'Morning, noon & evening checklists',
      icon: 'reports',
      onPress: () => router.push('/(patient)/medication-schedule' as Href),
    },
    {
      id: 'adherence',
      title: 'Adherence',
      subtitle: 'Adherence performance & progress metrics',
      icon: 'reports',
      onPress: () => router.push('/(patient)/adherence' as Href),
    },
    {
      id: 'caregiver',
      title: 'Caregiver',
      subtitle: 'Configure your emergency helpers',
      icon: 'patients',
      onPress: () => router.push('/settings/caregivers' as Href),
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: `${patientName}'s details`,
      icon: 'profile',
      onPress: () => router.push('/(app)/(tabs)/profile' as Href),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences & account settings',
      icon: 'eye',
      onPress: () => router.push('/settings' as Href),
    },
    {
      id: 'help',
      title: 'Help',
      subtitle: 'Support, FAQs & contact help',
      icon: 'help',
      onPress: () => router.push('/settings/help' as Href),
    },
  ];

  return (
    <Screen
      title="Main Menu"
      subtitle="Explore all features of CareRx"
      activeTab="dashboard">
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.card,
              a11y.largerButtons && styles.largeCard,
              pressed && styles.pressed,
            ]}>
            <View style={styles.iconCircle}>
              <CareIcon name={item.icon} size={20} color="#22996E" />
            </View>

            <View style={styles.textCol}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>

            <CareIcon name="chevron-right" size={18} color="#9CB0A6" />
          </Pressable>
        ))}
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  menuList: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  largeCard: {
    paddingVertical: 18,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E3E2F',
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#71827A',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.75,
  },
});
