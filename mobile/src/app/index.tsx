import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AuthNavigator from '../navigation/AuthNavigator';

export default function Index() {
  const params = useLocalSearchParams();
  const initialRoute = (params?.route as string) || (params?.screen as string) || 'Splash';
  return <AuthNavigator initialRoute={initialRoute} />;
}
