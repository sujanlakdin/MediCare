import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface CaregiverHeaderProps {
  caregiverName?: string;
  subtext?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export function CaregiverHeader({
  caregiverName = 'Sarah',
  subtext = "Here's Eleanor's medication update",
  notificationCount = 1,
  onNotificationPress,
  onProfilePress,
}: CaregiverHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>Good morning, {caregiverName}</Text>
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
              uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
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
