import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { router } from 'expo-router';

const PermissionDenied = () => {
  return (
    <View style={styles.messageContainer}>
      <Ionicons name="warning" size={48} color="#ff3b7f" />
      <Text style={styles.messageText}>Dostęp do kamery jest wymagany do skanowania kodów QR</Text>
      <Pressable
        style={styles.button}
        onPress={() => Camera.requestCameraPermissionsAsync()}>
        <Text style={styles.buttonText}>Przyznaj Uprawnienia</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.back()}>
        <Text style={styles.buttonText}>Wróć</Text>
      </Pressable>
    </View>
  );
};

export default PermissionDenied;

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