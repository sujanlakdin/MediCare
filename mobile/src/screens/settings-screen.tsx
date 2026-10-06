import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

type SettingsItem = {
  id: string;
  title: string;
  icon: CareIconName;
  onPress: () => void;
};

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { settings } = useAccessibility();
  const [privacyVisible, setPrivacyVisible] = useState(false);

  const items: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: 'profile',
      onPress: () => router.push('/profile' as Href),
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: 'bell',
      onPress: () => router.push('/settings/notifications' as Href),
    },
    {
      id: 'accessibility',
      title: 'Accessibility Options',
      icon: 'eye',
      onPress: () => router.push('/settings/accessibility' as Href),
    },
    {
      id: 'emergency',
      title: 'Emergency & Caregiver',
      icon: 'heart',
      onPress: () => router.push('/settings/caregivers' as Href),
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Protection',
      icon: 'shield',
      onPress: () => setPrivacyVisible(true),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help',
      onPress: () => router.push('/settings/help' as Href),
    },
  ];

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out of MediCare?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => void signOut(),
      },
    ]);
  }

  return (
    <Screen
      title="Settings"
      subtitle="Control and configure your application"
      activeTab="profile">
      {/* Settings Options Card */}
      <View style={styles.card}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View key={item.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.itemRow,
                  settings.largerButtons && styles.largeItemRow,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.iconCircle}>
                  <CareIcon name={item.icon} size={18} color="#22996E" />
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <CareIcon name="chevron-right" size={18} color="#9CB0A6" />
              </Pressable>
              {!isLast ? <View style={styles.divider} /> : null}
            </View>
          );
        })}
      </View>

      {/* Log Out Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log Out"
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          settings.largerButtons && styles.largeLogoutButton,
          pressed && styles.pressed,
        ]}>
        <CareIcon name="logout" size={18} color="#E53935" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>

      {/* Privacy Notice Modal */}
      <Modal
        visible={privacyVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPrivacyVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <CareIcon name="shield" size={24} color="#22996E" />
              <Text style={styles.modalTitle}>Privacy & Data Protection</Text>
            </View>
            <Text style={styles.modalBody}>
              Your health information and medication records are strictly encrypted
              and confidential. We comply with medical privacy standards to ensure
              only you and your designated caregivers have access.
            </Text>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setPrivacyVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EDE8',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  largeItemRow: {
    paddingVertical: 18,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1C2A24',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
    marginLeft: 64,
  },
  logoutButton: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FACDCD',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  largeLogoutButton: {
    height: 62,
  },
  logoutButtonText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '700',
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
    gap: 14,
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
  modalCloseButton: {
    backgroundColor: '#0E3E2F',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});