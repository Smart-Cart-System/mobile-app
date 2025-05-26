import { Image, StyleSheet, Platform, TouchableOpacity, View, Dimensions, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cartSessionService } from '@/services/api';

const { width } = Dimensions.get('window');
// Calculate card width to ensure true two-column layout with proper spacing
const CARD_WIDTH = (width - 100) / 2; // Adjusted to account for outer padding and gap
const CARD_MARGIN = 10; // Gap between cards

export default function HomeScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  
  const [activeCartSession, setActiveCartSession] = useState<{
    session_id: number;
    cart_id: number;
    created_at: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  const [recommendedProducts, setRecommendedProducts] = useState([
    { id: 1, name: 'Vegetables Pack', price: '$12.99', image: require('@/assets/images/icon.png') },
    { id: 2, name: 'Dairy Bundle', price: '$8.50', image: require('@/assets/images/icon.png') },
    { id: 3, name: 'Bakery Essentials', price: '$10.75', image: require('@/assets/images/icon.png') },
    { id: 4, name: 'Organic Fruit Pack', price: '$9.99', image: require('@/assets/images/icon.png') },
  ]);

  // Check for active cart session whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkActiveCartSession();
    }, [])
  );

  // Function to check if there's an active cart session
  const checkActiveCartSession = async () => {
    try {
      setIsLoadingSession(true);
      const sessionId = await SecureStore.getItemAsync('cartSessionId');
      const cartId = await SecureStore.getItemAsync('cartId');
      
      if (sessionId && cartId) {
        // Get session data from secure storage
        const createdAt = await SecureStore.getItemAsync('cartSessionCreatedAt') || new Date().toISOString();
        
        setActiveCartSession({
          session_id: parseInt(sessionId),
          cart_id: parseInt(cartId),
          created_at: createdAt
        });
      } else {
        setActiveCartSession(null);
      }
    } catch (error) {
      console.error('Error checking cart session:', error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleScanQR = () => {
    router.push("/qr-scanner");
  };

  const handleEndSession = async () => {
    try {
      // Call the API service to end the session
      await cartSessionService.endSession();
      // Update local state to reflect the ended session
      setActiveCartSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Format the created_at date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ECF6FF', dark: '#1A2634' }}
      headerImage={
        <Image
          source={require('@/assets/images/duckyCart.webp')}
          style={styles.reactLogo}
          resizeMode="contain"
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <HelloWave />
          <ThemedText type="title" style={styles.welcomeText}>Welcome to ShopScan!</ThemedText>
          <ThemedText style={styles.subtitleText}>Your smart shopping companion</ThemedText>
        </ThemedView>
        
        {isLoadingSession ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={styles.loadingText}>Checking session status...</ThemedText>
          </View>
        ) : activeCartSession ? (
          // Active session view
          <ThemedView 
            variant="card" 
            radius="large" 
            useShadow 
            intensity="low" 
            style={styles.activeSessionContainer}
          >
            <View style={styles.sessionHeader}>
              <Ionicons name="cart-outline" size={26} color={tintColor} />
              <ThemedText style={styles.sessionTitle}>Active Shopping Session</ThemedText>
            </View>
            
            <View style={styles.sessionDetails}>
              <View style={styles.sessionDetail}>
                <ThemedText style={styles.sessionDetailLabel}>Cart ID:</ThemedText>
                <ThemedText style={styles.sessionDetailValue}>{activeCartSession.cart_id}</ThemedText>
              </View>
              
              <View style={styles.sessionDetail}>
                <ThemedText style={styles.sessionDetailLabel}>Started:</ThemedText>
                <ThemedText style={styles.sessionDetailValue}>{formatDate(activeCartSession.created_at)}</ThemedText>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.endSessionButton} 
              onPress={handleEndSession}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.endSessionText}>End Shopping Session</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          // Start shopping button (when no active session)
          <TouchableOpacity 
            style={styles.goRideButton} 
            onPress={handleScanQR}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#4CAF50', '#3E9142']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="qr-code-outline" size={28} color="#FFFFFF" style={styles.buttonIcon} />
              <ThemedText style={styles.goRideButtonText}>Start Shopping</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {/* Recommended Products */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recommended Products</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Based on your previous purchases</ThemedText>
          
          <View style={styles.productList}>
            {recommendedProducts.map(product => (
              <View key={product.id} style={styles.productCardWrapper}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={{width: '100%'}}
                >
                  <ThemedView 
                    variant="card" 
                    radius="large" 
                    useShadow 
                    intensity="low" 
                    style={styles.productCard}
                  >
                    <View style={styles.imageContainer}>
                      <Image source={product.image} style={styles.productImage} />
                    </View>
                    <View style={styles.productTextContainer}>
                      <ThemedText style={styles.productName} numberOfLines={2}>{product.name}</ThemedText>
                      <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                    </View>
                  </ThemedView>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 17,
    opacity: 0.8,
    marginTop: 6,
  },
  goRideButton: {
    borderRadius: 20,
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  gradientButton: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 12,
  },
  goRideButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 20,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -CARD_MARGIN/2, // Negative margin to offset card margins
  },
  productCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 20,
    paddingHorizontal: CARD_MARGIN/2,
  },
  productCard: {
    borderRadius: 16,
    padding: 14,
    height: 200, // Height that works better for the card size
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(240, 240, 240, 0.3)',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  productTextContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50', // Highlight price with a green color
  },
  reactLogo: {
    height: 400,
    width: 400,
    top: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  activeSessionContainer: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 20, // Matching the large radius used elsewhere
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  sessionDetails: {
    marginBottom: 20,
    backgroundColor: 'rgba(240, 240, 240, 0.2)',
    padding: 16,
    borderRadius: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionDetailLabel: {
    fontSize: 15,
    opacity: 0.8,
  },
  sessionDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  endSessionButton: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FF5252',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  endSessionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
