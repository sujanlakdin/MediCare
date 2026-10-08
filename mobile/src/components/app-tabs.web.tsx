import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/contexts/auth-context';

export default function AppTabs() {
  const { user } = useAuth();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <View style={StyleSheet.flatten([styles.tabBar, user?.role === 'patient' && styles.hidden])}>
          <TabTrigger name="index" href={'/(app)/(tabs)' as Href} asChild>
            <TabBtn label="Dashboard" />
          </TabTrigger>
          <TabTrigger name="explore" href={'/(app)/(tabs)/explore' as Href} asChild>
            <TabBtn label="Explore" />
          </TabTrigger>
          <TabTrigger name="profile" href={'/(app)/(tabs)/profile' as Href} asChild>
            <TabBtn label="Profile" />
          </TabTrigger>
          <TabTrigger name="settings" href={'/(app)/(tabs)/settings' as Href} asChild>
            <TabBtn label="Settings" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabBtn({ label, isFocused, onPress }: TabTriggerSlotProps & { label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={StyleSheet.flatten([styles.tab, isFocused && styles.tabActive])}>
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EFE9',
    paddingBottom: 12,
    paddingTop: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  hidden: {
    display: 'none',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#E8F6EF',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E9E96',
  },
  tabLabelActive: {
    color: '#0E3E2F',
    fontWeight: '700',
  },
});
