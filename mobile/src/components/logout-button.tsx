import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { CareIcon } from '@/components/care-icon';
import { useAuth } from '@/contexts/auth-context';

type LogoutButtonProps = {
  largerButtons?: boolean;
};

export function LogoutButton({ largerButtons = false }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    setIsSigningOut(true);
    setError('');
    try {
      await signOut();
      setIsConfirmVisible(false);
      router.replace('/(auth)/login');
    } catch {
      setError('Unable to log out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log Out"
        onPress={() => {
          setError('');
          setIsConfirmVisible(true);
        }}
        style={({ pressed }) => [
          styles.button,
          largerButtons && styles.largeButton,
          pressed && styles.pressed,
        ]}>
        <CareIcon name="logout" size={18} color="#E53935" />
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>

      <Modal
        visible={isConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSigningOut) setIsConfirmVisible(false);
        }}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>Log Out</Text>
            <Text style={styles.message}>Are you sure you want to log out of MediCare?</Text>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSigningOut}
                onPress={() => setIsConfirmVisible(false)}
                style={[styles.actionButton, styles.cancelButton]}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm log out"
                disabled={isSigningOut}
                onPress={() => void handleLogout()}
                style={[styles.actionButton, styles.confirmButton, isSigningOut && styles.disabled]}>
                {isSigningOut
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.confirmText}>Log Out</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FACDCD',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  largeButton: { minHeight: 62 },
  buttonText: { color: '#E53935', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  title: { color: '#0E3E2F', fontSize: 18, fontWeight: '700' },
  message: { color: '#4A6054', fontSize: 15, lineHeight: 21 },
  error: { color: '#B42318', fontSize: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionButton: {
    minWidth: 100,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  cancelButton: { backgroundColor: '#EEF4F1' },
  cancelText: { color: '#0E3E2F', fontWeight: '700' },
  confirmButton: { backgroundColor: '#C62828' },
  confirmText: { color: '#FFFFFF', fontWeight: '700' },
  disabled: { opacity: 0.65 },
});
