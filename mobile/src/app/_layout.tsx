import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AccessibilityProvider, useAccessibility } from '@/contexts/accessibility-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AccessibilityProvider>
          <RootNavigator />
          <AnimatedSplashOverlay />
        </AccessibilityProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isLoading: authLoading, token } = useAuth();
  const { isLoading: accessibilityLoading } = useAccessibility();
  const isLoading = authLoading || accessibilityLoading;

  useEffect(() => {
    if (!isLoading) void SplashScreen.hideAsync();
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" accessibilityLabel="Loading your account" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(token)}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(patient)" />
        <Stack.Screen name="(caregiver)" />
        <Stack.Screen name="complete-profile" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
