import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Camera, CameraView } from 'expo-camera';

export default function OCRScannerScreen() {
  const [capturing, setCapturing] = useState(false);
  const router = useRouter();

  const handleCapture = async () => {
    setCapturing(true);
    try {
      // In a real app, we would capture an image and send it to an OCR API
      // For demo purposes, we'll simulate OCR text extraction
      setTimeout(() => {
        setCapturing(false);
        
        // Simulated OCR text result
        const extractedText = [
          "Milk",
          "Eggs",
          "Bread",
          "Butter",
          "Cheese"
        ];
        
        Alert.alert(
          "Text Detected",
          `The following items were detected:\n${extractedText.join('\n')}`,
          [
            {
              text: "Add to Checklist",
              onPress: () => {
                // In a real app, we would add these items to a checklist
                router.back();
              }
            },
            { text: "Cancel", style: "cancel" }
          ]
        );
      }, 2000);
    } catch (error) {
      console.log('Error taking picture:', error);
      setCapturing(false);
      Alert.alert(
        "Error",
        "Failed to capture image. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CameraView style={StyleSheet.absoluteFillObject} facing="back">
        <ThemedView style={styles.overlay}>
          <ThemedView style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {capturing ? "Processing..." : "Position text in the frame and tap the button"}
            </ThemedText>
            
            <TouchableOpacity 
              style={[styles.captureButton, capturing && styles.capturingButton]}
              onPress={handleCapture}
              disabled={capturing}
            >
              <ThemedView style={styles.captureButtonInner} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});