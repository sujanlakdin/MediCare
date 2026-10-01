import { Link, router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/services/api';

type AuthScreenProps = { mode: 'sign-in' | 'register' };

export default function AuthScreen({ mode }: AuthScreenProps) {
  const { signIn, register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isRegister = mode === 'register';

  async function submit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (isRegister && fullName.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (isRegister && password.length < 10) {
      setError('Choose a password with at least 10 characters.');
      return;
    }
    setIsSaving(true);
    try {
      if (isRegister) await register(fullName.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
      router.replace('/');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.form}>
          <ThemedText type="title" style={styles.title}>MediCare</ThemedText>
          <ThemedText type="subtitle">{isRegister ? 'Create account' : 'Welcome back'}</ThemedText>
          <ThemedText>Medication reminders and support, in one place.</ThemedText>
          {isRegister && (
            <Field label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" />
          )}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
          {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isRegister ? 'Create account' : 'Sign in'}
            disabled={isSaving}
            onPress={() => void submit()}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isSaving && styles.disabled]}>
            {isSaving ? <ActivityIndicator color="#ffffff" /> : <ThemedText style={styles.buttonText}>{isRegister ? 'Create account' : 'Sign in'}</ThemedText>}
          </Pressable>
          <ThemedText>
            {isRegister ? 'Already registered? ' : 'New to MediCare? '}
            <Link href={(isRegister ? '/sign-in' : '/register') as Href} accessibilityRole="link">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & { label: string };

function Field({ label, ...props }: FieldProps) {
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor="#666666"
        style={styles.input}
        autoCorrect={false}
        {...props}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },
  form: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: Spacing.three },
  title: { fontSize: 40, lineHeight: 48 },
  field: { gap: Spacing.one },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#737373',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    fontSize: 18,
    color: '#111111',
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#145c44',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
  },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.65 },
  error: { color: '#a22121' },
});