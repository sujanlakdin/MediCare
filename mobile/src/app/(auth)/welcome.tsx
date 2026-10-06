import React from 'react';
import { router } from 'expo-router';
import WelcomeScreen from '../../screens/auth/WelcomeScreen';

export default function WelcomeRoute() {
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Login' || screen === '/login') {
        router.push('/login' as any);
      } else if (screen === 'SignUp' || screen === '/signup') {
        router.push('/signup' as any);
      } else if (screen.includes('dashboard')) {
        router.replace('/(patient)/dashboard' as any);
      } else {
        router.push(screen as any);
      }
    },
    replace: (screen: string) => {
      if (screen === 'Login' || screen === '/login') {
        router.replace('/login' as any);
      } else if (screen === 'SignUp' || screen === '/signup') {
        router.replace('/signup' as any);
      } else if (screen.includes('dashboard')) {
        router.replace('/(patient)/dashboard' as any);
      } else {
        router.replace(screen as any);
      }
    },
    goBack: () => router.back(),
  };

  return <WelcomeScreen navigation={navigation} />;
}
