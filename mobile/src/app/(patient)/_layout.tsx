import React from 'react';
import { Stack } from 'expo-router';
import { PATIENT_COLORS } from '../../constants/patientTheme';

export default function PatientLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: PATIENT_COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="medications" />
      <Stack.Screen name="medication-detail" />
      <Stack.Screen name="medication-form" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="menu" />
    </Stack>
  );
}
