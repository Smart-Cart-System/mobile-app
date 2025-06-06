import { API_BASE_URL, UserCreate, User, LoginResponse } from './types';
import { safeSecureStore } from './secureStore';

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
