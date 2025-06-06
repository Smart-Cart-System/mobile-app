import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Navigation component that handles routing based on auth state
const AppNavigation = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();  const colorScheme = useColorScheme();
  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    const isAuthScreen = segments[0] === 'sign-in' || segments[0] === 'sign-up';
    
    if (!isLoggedIn && !isAuthScreen) {
      // Redirect to sign-in if not authenticated
      router.replace('/sign-in');
    } else if (isLoggedIn && isAuthScreen) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, segments, router]);  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="qr-scanner" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="ocr-scanner" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 }
    }}>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
