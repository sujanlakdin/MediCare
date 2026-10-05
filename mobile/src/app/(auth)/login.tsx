import React from 'react';
import { router } from 'expo-router';
import LoginScreen from '../../screens/auth/LoginScreen';

export default function LoginRoute() {
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'SignUp' || screen === '/signup') {
        router.push('/signup' as any);
      } else if (screen === 'Welcome' || screen === '/welcome') {
        router.push('/welcome' as any);
      } else if (screen.includes('dashboard')) {
        router.replace('/(patient)/dashboard' as any);
      } else {
        router.push(screen as any);
      }
    },
    replace: (screen: string) => {
      if (screen === 'SignUp' || screen === '/signup') {
        router.replace('/signup' as any);
      } else if (screen.includes('dashboard')) {
        router.replace('/(patient)/dashboard' as any);
      } else {
        router.replace(screen as any);
      }
    },
    goBack: () => router.back(),
  };

  return <LoginScreen navigation={navigation} />;
}
