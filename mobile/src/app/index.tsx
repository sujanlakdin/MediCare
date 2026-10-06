import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

export default function IndexRoute() {
  const { token } = useAuth();
  return <Redirect href={token ? '/(app)/(tabs)' : '/(auth)/splash'} />;
}
