import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create an authentication context to be used throughout the app
interface AuthContextType {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  authState: {
    userToken: string | null;
    isLoading: boolean;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Root layout with authentication provider
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [state, setState] = useState({
    userToken: null as string | null,
    isLoading: true,
  });
  
  const router = useRouter();
  const segments = useSegments();
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Sign in method to set user token in secure storage
  const signIn = useCallback(async (token: string) => {
    setState(prevState => ({ ...prevState, isLoading: true }));
    
    try {
      console.log("Storing new auth token");
      await SecureStore.setItemAsync('userToken', token);
      setState({ userToken: token, isLoading: false });
    } catch (e) {
      console.error('Error storing authentication token:', e);
      setState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, []);

  // Sign out method to remove user token from secure storage
  const signOut = useCallback(async () => {
    setState(prevState => ({ ...prevState, isLoading: true }));
    
    try {
      console.log("Removing auth token");
      await SecureStore.deleteItemAsync('userToken');
      setState({ userToken: null, isLoading: false });
    } catch (e) {
      console.error('Error removing authentication token:', e);
      setState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, []);

  // Check login state when app loads
  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        console.log('User token on load:', token);
        setState({ userToken: token, isLoading: false });
      } catch (e) {
        console.log('Error getting authentication token:', e);
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    };

    if (loaded) {
      checkLoginState().then(() => {
        console.log('Splash screen hidden');
        SplashScreen.hideAsync();
      });
    }
  }, [loaded]);

  // Handle navigation based on auth state
  useEffect(() => {
    // Wait for navigation to be ready
    if (state.isLoading || !segments) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isScanner = segments[0] === 'qr-scanner' || segments[0] === 'ocr-scanner';
    
    if (state.userToken) {
      // If user is authenticated
      if (!inAuthGroup && !isScanner) {
        // Only redirect non-tabs, non-scanner routes when authenticated
        console.log("Redirecting to tabs because user is authenticated");
        router.replace("/(tabs)");
      }
    } else if (!state.userToken && (inAuthGroup || isScanner)) {
      // Redirect to sign in if user is not signed in but trying to access protected routes
      console.log("Redirecting to sign-in because user is not authenticated");
      router.replace("/sign-in");
    }
  }, [state.userToken, state.isLoading, segments, router]);

  const authContext: AuthContextType = {
    signIn,
    signOut,
    authState: {
      userToken: state.userToken,
      isLoading: state.isLoading
    }
  };

  if (!loaded || state.isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 }
    }}>
      <AuthContext.Provider value={authContext}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="qr-scanner" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="ocr-scanner" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />

            {/* Use redirect props on initial route based on authentication status */}
            <Stack.Screen
              name="index"
              redirect={state.userToken ? true : false}
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
