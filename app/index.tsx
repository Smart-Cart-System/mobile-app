import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ActivityIndicator, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function RootIndex() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setIsAuthenticated(!!token);
      } catch (e) {
        console.error('Error checking authentication:', e);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/sign-in" />;
  }
}