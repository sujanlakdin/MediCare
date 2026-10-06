import React from 'react';
import { router } from 'expo-router';
import SignUpScreen from '../../screens/auth/SignUpScreen';

export default function SignUpRoute() {
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Login' || screen === '/login') {
        router.push('/login' as any);
      } else if (screen === 'Welcome' || screen === '/welcome') {
        router.push('/welcome' as any);
      } else if (screen.includes('dashboard')) {
        router.replace('/(patient)/dashboard' as any);
      } else {
        router.push(screen as any);
      }
    },
    replace: (screen: string) => {
      if (screen === 'Login' || screen === '/login') {
        router.replace('/login' as any);
      } else if (screen.includes('dashboard')) {
        router.replace('/(patient)/dashboard' as any);
      } else {
        router.replace(screen as any);
      }
    },
    goBack: () => router.back(),
  };

  return <SignUpScreen navigation={navigation} />;
}
