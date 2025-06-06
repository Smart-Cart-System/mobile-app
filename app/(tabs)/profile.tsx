import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const tintColor = useThemeColor({}, 'tint');
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Attempting to log out...");
      
      // Use the auth context logout method
      await logout();
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Logout Failed", "There was a problem logging out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }  };
  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Profile</ThemedText>
        <ThemedText>Loading user data...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Profile</ThemedText>
        {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>          <ThemedView style={styles.avatar}>
            <ThemedText style={styles.avatarText}>
              {user.fullName ? user.fullName.split(' ').map(name => name[0]).join('').toUpperCase() : 'N/A'}
            </ThemedText>
          </ThemedView>
        </View>
          <View style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>{user.fullName || 'N/A'}</ThemedText>
          <ThemedText style={styles.profileEmail}>{user.email || 'N/A'}</ThemedText>
          <ThemedText style={styles.profileUsername}>@{user.username || 'N/A'}</ThemedText>
        </View>
        </View>

        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
        {/* User Information Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile Information</ThemedText>
            <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Full Name:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.fullName || 'N/A'}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Username:</ThemedText>
            <ThemedText style={styles.infoValue}>@{user.username || 'N/A'}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Email:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.email || 'N/A'}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Phone:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.phoneNumber || 'N/A'}</ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Address:</ThemedText>
            <ThemedText style={styles.infoValue}>{user.address || 'Not provided'}</ThemedText>
          </View>
        </ThemedView>
        
        {/* Notification Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
          <View style={styles.settingItem}>
            <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
            <Switch
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>
        </ThemedView>
        
        {/* Log Out Button */}        <TouchableOpacity 
          style={[styles.logoutButton, isLoggingOut && styles.disabledButton]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ThemedText style={styles.logoutText}>Logging out...</ThemedText>
          ) : (
            <ThemedText style={styles.logoutText}>Log Out</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    marginBottom: 28,
    fontSize: 30,
    fontWeight: '700',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    opacity: 0.6,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  editButtonText: {
    color: '#007BFF',
    fontSize: 14,    fontWeight: '600',
  },
  profileContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,    textAlign: 'right',
  },
  section: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 18,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  pointsLabel: {
    fontSize: 15,
    opacity: 0.7,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
    marginTop: 10,
    borderRadius: 0, // Remove any accidental border radius
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '500',    marginRight: 6,
  },
  phoneSection: {
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  verifyPhoneButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  verifyPhoneText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  verificationInputContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  verificationInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    color: '#fff',
    fontSize: 18,
  },
  verifyButton: {
    backgroundColor: '#007BFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  verifiedText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',    fontWeight: '600',
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    margin: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  languageText: {
    fontSize: 15,
  },
  selectedLanguageText: {
    fontWeight: '600',
    color: '#007BFF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
  },
});