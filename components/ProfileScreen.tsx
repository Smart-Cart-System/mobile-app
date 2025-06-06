import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  if (!user) {
    // This should ideally not be reachable if navigation is set up correctly
    return (
      <View style={styles.container}>
        <Text>No user data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{user.fullName || 'N/A'}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>@{user.username || 'N/A'}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email || 'N/A'}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phoneNumber || 'N/A'}</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{user.address || 'Not provided'}</Text>
      </View>
      
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={logout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  logoutContainer: {
    marginTop: 30,
    marginBottom: 50
  }
});

export default ProfileScreen;
