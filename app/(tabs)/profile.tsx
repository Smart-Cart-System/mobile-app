import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { authService } from '@/services/api';
import { useAuth } from '@/app/_layout';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const router = useRouter();
  const { signOut } = useAuth();
  
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (234) 567-8910',
    isPhoneVerified: false,
    points: 450,
    language: 'English',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Attempting to log out...");
      
      // Call the API service to clear session data
      await authService.logout();
      
      // Use the auth context to sign out, which will trigger the redirect
      await signOut();
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Logout Failed", "There was a problem logging out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleVerifyPhone = () => {
    setIsVerifyingPhone(true);
  };

  const submitPhoneVerification = () => {
    // In a real app, this would send the verification code to the server
    if (phoneVerificationCode === '1234') { // Mock verification code check
      setUser(prev => ({
        ...prev,
        isPhoneVerified: true
      }));
    }
    setIsVerifyingPhone(false);
    setPhoneVerificationCode('');
  };

  const changeLanguage = (lang: string) => {
    setUser(prev => ({
      ...prev,
      language: lang
    }));
    // In a real app, this would trigger language change throughout the app
  };

  const languages = ['English', 'Spanish', 'French', 'Arabic', 'Chinese'];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Profile</ThemedText>
      
      {/* Profile Header */}
      <ThemedView style={styles.profileHeader}>
        <ThemedView style={styles.avatarContainer}>
          <ThemedView style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user.name.split(' ').map(name => name[0]).join('')}
            </ThemedText>
          </ThemedView>
          {user.isPhoneVerified && (
            <ThemedView style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </ThemedView>
          )}
        </ThemedView>
        
        <ThemedView style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>{user.name}</ThemedText>
          <ThemedText style={styles.profileEmail}>{user.email}</ThemedText>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
              <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={toggleEdit}>
              <ThemedText style={styles.editButtonText}>Save Changes</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>
      
      <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        {/* Points Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Points</ThemedText>
          <ThemedView style={styles.pointsContainer}>
            <ThemedText style={styles.pointsValue}>{user.points}</ThemedText>
            <ThemedText style={styles.pointsLabel}>points collected</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <ThemedText style={styles.viewDetailsText}>View Rewards</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>
        
        {/* Phone Verification */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Phone Verification</ThemedText>
          <ThemedView style={styles.phoneSection}>
            <ThemedText style={styles.phoneNumber}>{user.phone}</ThemedText>
            {!user.isPhoneVerified ? (
              isVerifyingPhone ? (
                <ThemedView style={styles.verificationInputContainer}>
                  <TextInput
                    style={styles.verificationInput}
                    placeholder="Enter 4-digit code"
                    placeholderTextColor="#999"
                    value={phoneVerificationCode}
                    onChangeText={setPhoneVerificationCode}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  <TouchableOpacity 
                    style={styles.verifyButton}
                    onPress={submitPhoneVerification}
                  >
                    <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ) : (
                <TouchableOpacity 
                  style={styles.verifyPhoneButton}
                  onPress={handleVerifyPhone}
                >
                  <ThemedText style={styles.verifyPhoneText}>Verify Now</ThemedText>
                </TouchableOpacity>
              )
            ) : (
              <ThemedView style={styles.verifiedContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <ThemedText style={styles.verifiedText}>Verified</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
        
        {/* Language Selection */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Language</ThemedText>
          <ThemedView style={styles.languageContainer}>
            {languages.map((lang) => (
              <TouchableOpacity 
                key={lang}
                style={[
                  styles.languageOption,
                  user.language === lang && styles.selectedLanguage
                ]}
                onPress={() => changeLanguage(lang)}
              >
                <ThemedText 
                  style={[
                    styles.languageText,
                    user.language === lang && styles.selectedLanguageText
                  ]}
                >
                  {lang}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
        
        {/* Notification Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          <ThemedView style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
            <Switch
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </ThemedView>
        </ThemedView>
        
        {/* Log Out Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.disabledButton]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ThemedText style={styles.logoutText}>Logging out...</ThemedText>
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FFF" style={styles.logoutIcon} />
              <ThemedText style={styles.logoutText}>Log Out</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
  },
  profileContent: {
    flex: 1,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  pointsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  phoneSection: {
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 18,
    marginBottom: 12,
  },
  verifyPhoneButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  verifyPhoneText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  verificationInputContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  verificationInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    color: '#fff',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  languageOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
  },
  languageText: {
    fontSize: 14,
  },
  selectedLanguageText: {
    fontWeight: '600',
    color: '#007BFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});