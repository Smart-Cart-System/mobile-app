import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Text,
  Dimensions,
  StatusBar,
  Platform,
  Image, // Import Image component
  ActivityIndicator, // For processing indicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CameraView } from 'expo-camera';
import { Camera } from 'expo-camera'; // Keep for permissions

export default function OCRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null); // Store captured photo URI
  const [isPreviewing, setIsPreviewing] = useState(false); // State to toggle between camera and preview
  const [isProcessing, setIsProcessing] = useState(false); // State for simulated API call
  const cameraRef = useRef<CameraView>(null); // Ref to access CameraView methods
  const router = useRouter();

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // --- Capture Photo ---
  const handleCapture = async () => {
    if (cameraRef.current && !isPreviewing) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          // You can add options like quality, base64, exif here if needed
          quality: 0.7, // Example: Set quality
        });
        if (photo) {
          setPhotoUri(photo.uri);
          setIsPreviewing(true); // Switch to preview mode
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    }
  };

  // --- Retake Photo ---
  const handleRetake = () => {
    setPhotoUri(null);
    setIsPreviewing(false); // Go back to camera view
    setIsProcessing(false); // Ensure processing state is reset
  };

  // --- Process Photo (Simulated API Call) ---
  const handleUsePhoto = async () => {
    if (!photoUri) return;
    setIsProcessing(true);

    console.log('Simulating API call with photo URI:', photoUri);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Shortened delay slightly

      const extractedText = [
        "Milk (Organic)",
        "Free-Range Eggs (Dozen)",
        "Sourdough Bread",
        "Unsalted Butter",
        "Cheddar Cheese (Sharp)",
        "Apples (Fuji)",
        "Spinach",
        "Chicken Breast",
      ];

      setIsProcessing(false);

      Alert.alert(
        'Text Detected',
        `The following items were detected:\n\n${extractedText.join('\n')}\n\nCreate a new checklist with these items?`,
        [
          {
            text: 'Create Checklist',
            onPress: () => {
              console.log('Navigating back with items:', extractedText);

              router.replace({
                pathname: '/(tabs)/checklist',
                params: {
                  newItemsFromOCR: JSON.stringify(extractedText)
                }
              });
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
                // If cancelled, just stay on the preview screen.
            }
          },
        ]
      );

    } catch (error) {
      console.error('Error processing image (simulated):', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
  };

  // --- Close Screen ---
  const handleClose = () => {
    router.back();
  };

  // --- Render Logic ---

  if (hasPermission === null) {
    return <ThemedView style={styles.container}><ThemedText>Requesting camera permission...</ThemedText></ThemedView>;
  }

  if (hasPermission === false) {
    return <ThemedView style={styles.container}><ThemedText>No access to camera</ThemedText></ThemedView>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Conditionally render Camera or Image Preview */}
      {isPreviewing && photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.cameraView}
          facing="back"
          enableTorch={false}
          // Add mode='picture' if available and needed, depending on expo-camera version
        />
      )}

      {/* Overlay with controls */}
      <View style={styles.overlay}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} disabled={isProcessing}>
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </ThemedView>

        {/* Footer - Content changes based on state */}
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            {isProcessing ? "Processing..." :
             isPreviewing ? "Use this photo or retake." :
             "Position text in the frame and tap capture"}
          </ThemedText>

          {/* Buttons */}
          {isProcessing ? (
             <ActivityIndicator size="large" color="#FFFFFF" />
          ) : isPreviewing ? (
            // Preview Buttons (Retake / Use Photo)
            <View style={styles.previewButtonsContainer}>
              <TouchableOpacity style={[styles.previewButton, styles.retakeButton]} onPress={handleRetake}>
                <Ionicons name="refresh" size={24} color="#FFFFFF" style={{ marginRight: 8 }}/>
                <ThemedText style={styles.previewButtonText}>Retake</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.previewButton, styles.usePhotoButton]} onPress={handleUsePhoto}>
                 <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }}/>
                <ThemedText style={styles.previewButtonText}>Use Photo</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            // Capture Button
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={isProcessing} // Disable while processing even though it shouldn't be visible
            >
              <ThemedView style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}
        </ThemedView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraView: {
    // Make camera fill the container, overlay will sit on top
    ...StyleSheet.absoluteFillObject,
  },
  previewImage: {
    // Make preview image fill the container
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain', // Or 'cover', depending on desired look
  },
  overlay: {
    // Covers the entire screen, on top of camera/preview
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // Make overlay background clear
    justifyContent: 'space-between', // Pushes header up, footer down
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.4)', // Semi-transparent header background
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingHorizontal: 16,
    paddingBottom: 10, // Add some padding below the button
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // Position top-left if needed, but padding in header works
  },
  footer: {
    backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent footer background
    padding: 24,
    paddingBottom: 40, // Extra padding at the bottom
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  // --- Capture Button Styles ---
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  // --- Preview Button Styles ---
  previewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30, // Make buttons rounded
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Base background
  },
  retakeButton: {
     backgroundColor: 'rgba(255, 80, 80, 0.7)', // Reddish tint for retake
     borderColor: 'rgba(255,255,255,0.5)',
     borderWidth: 1,
  },
  usePhotoButton: {
     backgroundColor: 'rgba(80, 200, 80, 0.7)', // Greenish tint for use
     borderColor: 'rgba(255,255,255,0.5)',
     borderWidth: 1,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Remove ThemedView specific styles if they conflict or aren't needed
  // For example, header and footer now have explicit background colors
});