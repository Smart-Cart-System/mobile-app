import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

// Helper function to ensure values are strings for SecureStore
const ensureString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
};

// Cross-platform storage solution
export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      return AsyncStorage.setItem(key, value);
    } else {
      return SecureStore.setItemAsync(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      return AsyncStorage.getItem(key);
    } else {
      return SecureStore.getItemAsync(key);
    }
  },
  
  deleteItem: async (key: string): Promise<void> => {
    if (isWeb) {
      return AsyncStorage.removeItem(key);
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  }
};

// Safe wrapper for cross-platform storage to prevent type errors
export const safeSecureStore = {
  async setItemAsync(key: string, value: any): Promise<void> {
    try {
      const stringValue = ensureString(value);
      await storage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error storing ${key} in storage:`, error);
      throw error;
    }
  },
  
  async getItemAsync(key: string): Promise<string | null> {
    return await storage.getItem(key);
  },
  
  async deleteItemAsync(key: string): Promise<void> {
    return await storage.deleteItem(key);
  }
};
