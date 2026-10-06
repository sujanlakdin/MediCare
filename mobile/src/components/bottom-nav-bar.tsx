import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router, type Href } from 'expo-router';
import { CareIcon, type CareIconName } from './care-icon';
import { useAccessibility } from '@/contexts/accessibility-context';

export type TabKey = 'dashboard' | 'patients' | 'reports' | 'alerts' | 'profile';

type TabItem = {
  key: TabKey;
  label: string;
  icon: CareIconName;
  href: Href;
};

const TABS: TabItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/' as Href },
  { key: 'patients', label: 'Patients', icon: 'patients', href: '/explore' as Href },
  { key: 'reports', label: 'Reports', icon: 'reports', href: '/' as Href },
  { key: 'alerts', label: 'Alerts', icon: 'alerts', href: '/settings/notifications' as Href },
  { key: 'profile', label: 'Profile', icon: 'profile', href: '/profile' as Href },
];

export function BottomNavBar({ activeTab = 'profile' }: { activeTab?: TabKey }) {
  const { settings } = useAccessibility();

  return (
    <View style={[styles.container, settings.largerButtons && styles.largeContainer]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const color = isActive ? '#0E3E2F' : '#8E9E96';

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} tab`}
              accessibilityState={{ selected: isActive }}
              onPress={() => {
                if (!isActive) {
                  router.push(tab.href);
                }
              }}
              style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
              <CareIcon name={tab.icon} size={22} color={color} />
              <Text
                style={[
                  styles.tabLabel,
                  { color },
                  isActive && styles.activeTabLabel,
                  settings.largerButtons && styles.largeTabLabel,
                ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EFE9',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
  },
  largeContainer: {
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    paddingTop: 12,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    minWidth: 60,
  },
  pressed: {
    opacity: 0.65,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  largeTabLabel: {
    fontSize: 13,
  },
});
