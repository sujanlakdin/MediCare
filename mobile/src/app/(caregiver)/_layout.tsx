import React from 'react';
import { Redirect } from 'expo-router';
import CaregiverTabs from '@/components/caregiver-tabs';
import { useAuth } from '@/contexts/auth-context';

export default function CaregiverLayout() {
  const { user } = useAuth();

  if (user && user.role !== 'caregiver') {
    return <Redirect href={"/(app)/(tabs)" as any} />;
  }

  return <CaregiverTabs />;
}
