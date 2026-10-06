import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

  const [moduleNotice, setModuleNotice] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({
    visible: false,
    title: '',
    description: '',
  });

  const patientName = user?.fullName || 'Chathura Rajapakse';

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Main health & adherence tracking',
      icon: 'dashboard',
      onPress: () => router.push('/' as Href),
    },
    {
      id: 'medications',
      title: 'Medications',
      subtitle: 'View your active medications',
      icon: 'pharmacist',
      onPress: () => {
        setModuleNotice({
          visible: true,
          title: 'Medications Module',
          description:
            'This module manages patient pill schedules and dosages. When active prescriptions are synchronized, your medications will display here.',
        });
      },
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'Morning, noon & evening checklists',
      icon: 'reports',
      onPress: () => {
        setModuleNotice({
          visible: true,
          title: 'Medication Schedule',
          description:
            'View your upcoming morning, noon, and evening dose reminders. Configure your interval preferences in Notification Settings.',
        });
      },
    },
    {
      id: 'adherence',
      title: 'Adherence',
      subtitle: 'Adherence performance & progress metrics',
      icon: 'reports',
      onPress: () => {
        setModuleNotice({
          visible: true,
          title: 'Adherence Tracker',
          description:
            'Monitor your weekly and monthly compliance scores to keep track of taken versus missed doses.',
        });
      },
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
      onPress: () => router.push('/profile' as Href),
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

      {/* Module Info Notice Modal */}
      <Modal
        visible={moduleNotice.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setModuleNotice((prev) => ({ ...prev, visible: false }))
        }>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <CareIcon name="pharmacist" size={24} color="#22996E" />
              <Text style={styles.modalTitle}>{moduleNotice.title}</Text>
            </View>
            <Text style={styles.modalBody}>{moduleNotice.description}</Text>
            <Pressable
              onPress={() =>
                setModuleNotice((prev) => ({ ...prev, visible: false }))
              }
              style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>Understood</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0E3E2F',
  },
  modalBody: {
    fontSize: 14,
    color: '#4A6054',
    lineHeight: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#0E3E2F',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
