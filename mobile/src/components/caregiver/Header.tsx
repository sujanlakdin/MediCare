import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface CaregiverHeaderProps {
  caregiverName?: string;
  avatarUrl?: string;
  subtext?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export function CaregiverHeader({
  caregiverName = 'Kasun',
  avatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  subtext = "Here's Eleanor's medication update",
  notificationCount = 1,
  onNotificationPress,
  onProfilePress,
}: CaregiverHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{getGreeting()}, {caregiverName}</Text>
        <Text style={styles.subtext}>{subtext}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <Pressable style={styles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color={Colors.light.primary} />
          {notificationCount > 0 && (
            <View style={styles.notificationDot}>
              <Text style={styles.dotText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable style={styles.avatarButton} onPress={onProfilePress}>
          <Image
            source={{
              uri: avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            }}
            style={styles.avatar}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: -0.3,
  },
  subtext: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.light.alert,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarButton: {
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
