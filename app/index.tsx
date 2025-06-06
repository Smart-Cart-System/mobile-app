import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function RootIndex() {
  const { isLoggedIn, isLoading } = useAuth();
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  // Redirect based on authentication status
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/sign-in" />;
  }
}