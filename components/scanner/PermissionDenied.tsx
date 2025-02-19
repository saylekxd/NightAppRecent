import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useRouter } from 'expo-router';

export function PermissionDenied() {
  const router = useRouter();
  
  return (
    <View style={styles.messageContainer}>
      <Ionicons name="warning" size={48} color="#ff3b7f" />
      <Text style={styles.messageText}>Camera access is required to scan QR codes</Text>
      <Pressable
        style={styles.button}
        onPress={() => Camera.requestCameraPermissionsAsync()}>
        <Text style={styles.buttonText}>Grant Permission</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    marginVertical: 5,
  },
  secondaryButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});