import { Image, StyleSheet, Platform, TouchableOpacity, View, Dimensions } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  
  const [recommendedProducts, setRecommendedProducts] = useState([
    { id: 1, name: 'Fresh Vegetables Pack', price: '$12.99', image: require('@/assets/images/icon.png') },
    { id: 2, name: 'Dairy Products Bundle', price: '$8.50', image: require('@/assets/images/icon.png') },
    { id: 3, name: 'Bakery Essentials', price: '$10.75', image: require('@/assets/images/icon.png') },
  ]);

  const handleScanQR = () => {
    router.push("./qr-scanner");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ECF6FF', dark: '#1A2634' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
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
        
        {/* Go Ride (Scan QR) Button */}
        <TouchableOpacity 
          style={styles.goRideButton} 
          onPress={handleScanQR}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="qr-code-outline" size={28} color="#FFFFFF" style={styles.buttonIcon} />
            <ThemedText style={styles.goRideButtonText}>Start Shopping</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Recommended Products */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recommended Products</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Based on your previous purchases</ThemedText>
          
          <View style={styles.productList}>
            {recommendedProducts.map(product => (
              <TouchableOpacity 
                key={product.id} 
                style={styles.productCardWrapper}
                activeOpacity={0.7}
              >
                <ThemedView style={styles.productCard}>
                  <View style={styles.imageContainer}>
                    <Image source={product.image} style={styles.productImage} />
                  </View>
                  <ThemedText style={styles.productName} numberOfLines={2}>{product.name}</ThemedText>
                  <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
                </ThemedView>
              </TouchableOpacity>
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
    padding: 16,
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitleText: {
    fontSize: 16,
    opacity: 0.8,
    marginTop: 4,
  },
  goRideButton: {
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  goRideButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  productList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
