import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { PATIENT_COLORS } from '../../constants/patientTheme';
import PatientIcon from './PatientIcons';

export type PatientTabName = 'dashboard' | 'medications' | 'reminders' | 'adherence' | 'profile';

interface BottomNavProps {
  currentTab: 'dashboard' | 'medications' | 'profile';
  onShowToast?: (message: string) => void;
}

interface NavItemDef {
  key: PatientTabName;
  label: string;
  icon: 'home' | 'pill' | 'bell' | 'chart' | 'user';
  route?: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', route: '/(patient)/dashboard' },
  { key: 'medications', label: 'Medications', icon: 'pill', route: '/(patient)/medications' },
  { key: 'reminders', label: 'Reminders', icon: 'bell' },
  { key: 'adherence', label: 'Adherence', icon: 'chart' },
  { key: 'profile', label: 'Profile', icon: 'user', route: '/(patient)/profile' },
];

/**
 * Bottom Navigation Bar
 * 5 items matching the reference layout:
 * - Dashboard: navigates to /dashboard
 * - Medications: navigates to /medications
 * - Reminders, Adherence, Profile: shows toast notification for other team members
 */
export default function BottomNav({ currentTab, onShowToast }: BottomNavProps) {
  const handlePress = (item: NavItemDef) => {
    if (item.route) {
      if (item.key === currentTab) return;
      router.replace(item.route as any);
    } else {
      if (onShowToast) {
        onShowToast('This screen belongs to another team member');
      }
    }
  };

  return (
    <View style={styles.navBar} accessibilityRole="tablist">
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === currentTab;
        const iconColor = isActive ? PATIENT_COLORS.brand : PATIENT_COLORS.muted;
        const textColor = isActive ? PATIENT_COLORS.deep : PATIENT_COLORS.muted;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navButton}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${item.label} tab`}
          >
            <PatientIcon
              name={item.icon}
              size={22}
              color={iconColor}
              strokeWidth={isActive ? 2.2 : 1.9}
            />
            <Text
              style={[
                styles.navLabel,
                { color: textColor },
                isActive && styles.navLabelActive,
              ]}
              allowFontScaling={true}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 78,
    flexDirection: 'row',
    backgroundColor: PATIENT_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: PATIENT_COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 14 : 6,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  navButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  navLabelActive: {
    fontWeight: '800',
  },
});
