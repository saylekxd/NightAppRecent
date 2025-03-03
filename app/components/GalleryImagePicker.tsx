import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { updateProfile } from '@/lib/auth';
import { LinearGradient } from 'expo-linear-gradient';

interface GalleryImagePickerProps {
  currentAvatarUrl: string | null;
  onImageSelected: (imageUrl: string) => void;
  onClose: () => void;
}

export function GalleryImagePicker({ 
  currentAvatarUrl, 
  onImageSelected, 
  onClose 
}: GalleryImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      setError(null);
      
      // Request permission to access the photo library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError('Permission to access gallery was denied');
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Error picking image');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;
    
    try {
      setUploading(true);
      setError(null);
      
      try {
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (!base64) {
          throw new Error('Failed to read image file');
        }
        
        // Generate a unique filename with fewer special characters
        const timestamp = Math.floor(Date.now() / 1000);
        const fileName = `avatar${timestamp}.jpg`;
        
        // Upload as base64
        const { data, error: uploadError } = await supabase
          .storage
          .from('avatars')
          .upload(fileName, decode(base64), {
            contentType: 'image/jpeg',
            upsert: true
          });
          
        if (uploadError) {
          throw new Error('Upload failed: ' + (uploadError.message || 'Storage error'));
        }
        
        if (!data) {
          throw new Error('No data returned from upload');
        }
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        if (!urlData || !urlData.publicUrl) {
          throw new Error('Failed to get public URL');
        }
        
        const publicUrl = urlData.publicUrl;
        
        // Update the profile
        try {
          const updatedProfile = await updateProfile({ avatar_url: publicUrl });
          
          if (!updatedProfile) {
            throw new Error('Profile update returned no data');
          }
          
          // Notify parent of success
          onImageSelected(publicUrl);
        } catch (profileError) {
          throw new Error('Failed to update profile: ' + (profileError instanceof Error ? profileError.message : 'Unknown error'));
        }
      } catch (processError) {
        // Fallback approach - use direct URL if available
        try {
          // Attempt direct profile update with the selectedImage URL if it's a remote URL
          if (selectedImage.startsWith('http')) {
            const updatedProfile = await updateProfile({ avatar_url: selectedImage });
            
            if (updatedProfile) {
              onImageSelected(selectedImage);
              return;
            }
          }
          
          throw new Error('Fallback approach failed');
        } catch (fallbackError) {
          throw processError; // Re-throw the original error
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unknown error during image upload';
      
      setError(errorMessage);
      Alert.alert(
        'Upload Error',
        `Could not upload image: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  // Helper function to decode base64
  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#121212']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Wybierz zdjęcie</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>
      
      <View style={styles.imagePreviewContainer}>
        <Image
          source={{ 
            uri: selectedImage || currentAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800'
          }}
          style={styles.imagePreview}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable onPress={pickImage} style={styles.button}>
          <Ionicons name="images-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Wybierz z galerii</Text>
        </Pressable>
        
        {selectedImage ? (
          <Pressable 
            onPress={uploadImage} 
            style={[styles.saveButton, uploading && styles.disabledButton]}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Zapisz zdjęcie</Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.saveButton, styles.disabledButton]}
            disabled={true}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Zapisz zdjęcie</Text>
          </Pressable>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    padding: 20,
    paddingBottom: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#ff3b7f',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  saveButton: {
    backgroundColor: '#ff3b7f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
}); 