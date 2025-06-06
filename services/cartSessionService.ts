import { API_BASE_URL } from './types';
import { safeSecureStore } from './secureStore';

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
      
      if (!sessionId) {
        console.log('No active session ID found to end');
        throw new Error('No active session to end');
      }

      console.log('Sending end session request to API with session ID:', sessionId);
      console.log('Request URL:', `${API_BASE_URL}/customer-session/${sessionId}/checkout`);
      
      const response = await fetch(`${API_BASE_URL}/customer-session/${sessionId}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('End session API response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to end session on server. Response body:', errorText);
        throw new Error(`Failed to end session: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('End session successful. Response data:', responseData);
      
      // Clear session data from secure storage only after successful API call
      await safeSecureStore.deleteItemAsync('cartSessionId');
      await safeSecureStore.deleteItemAsync('cartId');
      await safeSecureStore.deleteItemAsync('cartSessionCreatedAt');
      console.log('Session data cleared from secure storage');
      
    } catch (error) {
      console.error('Error in endSession:', error);
      throw error; // Re-throw to let the calling code handle the error
    }
  }
};
