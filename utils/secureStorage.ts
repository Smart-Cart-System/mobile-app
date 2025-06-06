import { storage } from '@/services/secureStore';

// List of all SecureStore keys used in the app
const SECURE_STORE_KEYS = ['userToken'];

/**
 * Delete a specific item from SecureStore
 * @param key - The key to delete
 */
export const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    await storage.deleteItem(key);
    console.log(`Deleted item with key: ${key}`);
  } catch (error) {
    console.error(`Error deleting item with key ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all items from SecureStore
 */
export const clearSecureStore = async (): Promise<void> => {
  try {
    await Promise.all(SECURE_STORE_KEYS.map(key => storage.deleteItem(key)));
    console.log('All items cleared from SecureStore');
  } catch (error) {
    console.error('Error clearing SecureStore:', error);
    throw error;
  }
};

/**
 * Get all items from SecureStore
 * @returns An object with all stored key-value pairs
 */
export const getAllSecureItems = async (): Promise<Record<string, string | null>> => {
  try {
    const items: Record<string, string | null> = {};
    await Promise.all(
      SECURE_STORE_KEYS.map(async (key) => {
        items[key] = await storage.getItem(key);
      })
    );
    return items;
  } catch (error) {
    console.error('Error getting all items from SecureStore:', error);
    throw error;
  }
};
