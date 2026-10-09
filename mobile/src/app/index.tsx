import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export default function IndexRoute() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3FAF7' }}>
        <ActivityIndicator size="large" color="#154D38" />
      </View>
    );
  }

  if (!token) return <Redirect href="/(auth)/splash" />;

  if (user?.role === 'caregiver') return <Redirect href={"/(caregiver)" as any} />;
  return <Redirect href={"/(patient)/dashboard" as any} />;
}
