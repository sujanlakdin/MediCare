import React from 'react';
import { Redirect } from 'expo-router';
import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/contexts/auth-context';

export default function MainTabsLayout() {
  const { user } = useAuth();

  if (user?.role === 'caregiver') {
    return <Redirect href={"/(caregiver)" as any} />;
  }

  return <AppTabs />;
}