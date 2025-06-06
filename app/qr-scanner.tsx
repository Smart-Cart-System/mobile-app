import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, Animated, Dimensions, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';
import { cartSessionService } from '@/services';

const { width } = Dimensions.get('window');

// Define the session type
interface SessionData {
  session_id: number;
  user_id: number;
  cart_id: number;
  is_active: boolean;
  created_at: string;
}

export default function QRScannerScreen() {
  const [scanning, setScanning] = useState(true);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to connect to the cart. Please try again.");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [session, setSession] = useState<SessionData | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (showSuccessModal || showErrorModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuccessModal, showErrorModal]);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText style={styles.loadingText}>Loading camera permissions...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText style={styles.loadingText}>We need your permission to use the camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    console.log('QR Code scanned:', { type, data });
    if (!scanning) return;
    setScanning(false);

    try {
      console.log('Calling API to process QR code...');
      const sessionData = await cartSessionService.scanQrCode(data);
      console.log('API response:', sessionData);
      setSession(sessionData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error scanning QR code:', error);

      if (error instanceof Error) {
        console.log('Error message:', error.message);
        if (error.message.includes('401')) {
          setErrorMessage('Invalid or expired QR code. Please try again.');
        } else if (error.message.includes('404')) {
          setErrorMessage('Cart not found. Please try another cart.');
        } else if (error.message.includes('400')) {
          setErrorMessage('Cart is not available at the moment. Please try another one.');
        } else {
          setErrorMessage(error.message || 'Failed to connect to the cart. Please try again.');
        }
      } else {
        console.log('Non-Error type encountered:', error);
        setErrorMessage('Network error. Please check your connection and try again.');
      }

      setShowErrorModal(true);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleErrorConfirm = () => {
    setShowErrorModal(false);
    setScanning(true);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {scanning ? (
        <View style={StyleSheet.absoluteFillObject}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
          />
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scannerFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Scan the QR code on the cart
              </ThemedText>
            </View>
          </View>
        </View>
      ) : (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Connecting to Cart...</ThemedText>
        </ThemedView>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }
            ]}
          >
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <ThemedText style={styles.modalTitle}>Cart Connected!</ThemedText>
            <ThemedText style={styles.modalDescription}>
              You are now connected to the shopping cart.
              {session ? `\nCart ID: ${session.cart_id}` : ''}
            </ThemedText>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={handleSuccessConfirm}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.modalButtonText}>Continue</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer, 
              styles.errorModal,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }
            ]}
          >
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle" size={60} color="#F44336" />
            </View>
            <ThemedText style={styles.modalTitle}>Connection Failed</ThemedText>
            <ThemedText style={styles.modalDescription}>
              {errorMessage}
            </ThemedText>
            <TouchableOpacity 
              style={[styles.modalButton, styles.errorButton]} 
              onPress={handleErrorConfirm}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.modalButtonText}>Try Again</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  footerText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorModal: {
    borderLeftWidth: 6,
    borderLeftColor: '#F44336',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});