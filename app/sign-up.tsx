import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { authService } from '@/services/api';
import { useAuth } from '@/app/_layout';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSignUp = async () => {
    // Validate inputs
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Clear previous errors
    setError(null);
    setIsLoading(true);

    try {
      // Call API to register user
      await authService.signup({
        full_name: fullName,
        email,
        password
      });
      
      // After successful signup, automatically log in the user
      const loginResponse = await authService.login(email, password);
      
      // Use the auth context to set the token which will automatically redirect
      await signIn(loginResponse.access_token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
      setError(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
          <ThemedText style={styles.appName}>ShopScan</ThemedText>
        </View>

        <View style={styles.formContainer}>
          <ThemedText style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>Sign up to get started with ShopScan</ThemedText>

          {error && (
            <ThemedView style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF6B6B" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <ThemedView style={styles.termsContainer}>
            <ThemedText style={styles.termsText}>
              By signing up, you agree to our{' '}
              <ThemedText style={styles.termsLink}>Terms of Service</ThemedText>
              {' '}and{' '}
              <ThemedText style={styles.termsLink}>Privacy Policy</ThemedText>
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.loadingButton]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator color="#FFFFFF" size="small" style={styles.spinner} />
                <ThemedText style={styles.buttonText}>Creating Account...</ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            )}
          </TouchableOpacity>

          <ThemedView style={styles.signInContainer}>
            <ThemedText style={styles.signInText}>Already have an account?</ThemedText>
            <TouchableOpacity onPress={handleSignIn}>
              <ThemedText style={styles.signInLink}>Sign In</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  termsLink: {
    color: '#007BFF',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingButton: {
    opacity: 0.7,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    opacity: 0.8,
    marginRight: 4,
  },
  signInLink: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '600',
  },
});