import * as SecureStore from 'expo-secure-store';

// API base URL from DuckyCart API
export const API_BASE_URL = "https://api.duckycart.me";

// User related types
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

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

// Safe wrapper for SecureStore to prevent type errors
const safeSecureStore = {
  async setItemAsync(key: string, value: any): Promise<void> {
    try {
      const stringValue = ensureString(value);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (error) {
      console.error(`Error storing ${key} in SecureStore:`, error);
      throw error;
    }
  },
  
  async getItemAsync(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },
  
  async deleteItemAsync(key: string): Promise<void> {
    return await SecureStore.deleteItemAsync(key);
  }
};

/**
 * Authentication service - handles login, signup and token management
 */
export const authService = {
  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   * @returns LoginResponse with token and user info
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      console.log('Sending login request to API with email:', email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Login API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed with response:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful. Received data:', data);

      // Ensure we store strings in SecureStore using our safe wrapper
      await safeSecureStore.setItemAsync('userToken', data.access_token);
      await safeSecureStore.setItemAsync('userData', data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param userData User registration data
   * @returns User object if successful
   */
  async signup(userData: UserCreate): Promise<User> {
    try {
      console.log('Sending signup request to API with data:', userData);
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Signup API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Signup failed with response:', errorData);
        throw new Error(errorData.detail || 'Registration failed');
      }

      const responseData = await response.json();
      console.log('Signup successful. Received data:', responseData);

      return responseData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  /**
   * Log out the user and clear stored tokens
   */
  async logout(): Promise<void> {
    try {
      await safeSecureStore.deleteItemAsync('userToken');
      await safeSecureStore.deleteItemAsync('userData');
      await safeSecureStore.deleteItemAsync('cartSessionId');
      await safeSecureStore.deleteItemAsync('cartId');
      await safeSecureStore.deleteItemAsync('cartSessionCreatedAt');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Check if the user is logged in
   * @returns true if user has a valid token
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await safeSecureStore.getItemAsync('userToken');
    return !!token;
  },
  
  /**
   * Get the current user information
   * @returns User object or null if not logged in
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await safeSecureStore.getItemAsync('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

/**
 * Cart session service - handles cart scanning and session management
 */
export const cartSessionService = {
  /**
   * Scan a QR code to start a cart session
   * @param token QR code token
   * @returns Session data
   */
  async scanQrCode(token: string) {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Sending QR code scan request to API with token:', token);
      const response = await fetch(`${API_BASE_URL}/customer-session/scan-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ token }),
      });

      console.log('QR code scan API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('QR code scan failed with response:', errorData);
        console.error('Response body:', await response.text());
        throw new Error(errorData.detail || `Error ${response.status}: Failed to connect to cart`);
      }

      const sessionData = await response.json();
      console.log('QR code scan successful. Received session data:', sessionData);

      // Store session data as strings using our safe wrapper
      await safeSecureStore.setItemAsync('cartSessionId', sessionData.session_id);
      await safeSecureStore.setItemAsync('cartId', sessionData.cart_id);
      await safeSecureStore.setItemAsync('cartSessionCreatedAt', sessionData.created_at);
      
      return sessionData;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  },
  
  /**
   * End the current cart session
   */
  async endSession(): Promise<void> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      const sessionId = await safeSecureStore.getItemAsync('cartSessionId');
      
      if (sessionId) {
        console.log('Sending end session request to API with session ID:', sessionId);
        const response = await fetch(`${API_BASE_URL}/customer-session/${sessionId}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });

        console.log('End session API response status:', response.status);
        if (!response.ok) {
          console.error('Failed to end session on server');
        }
      }
    } catch (error) {
      console.error('Error in endSession:', error);
    }
  }
};