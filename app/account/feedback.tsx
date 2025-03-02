import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/auth';

type FeedbackType = 'general' | 'bug' | 'feature' | 'other';

export default function FeedbackScreen() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const feedbackTypes = [
    { id: 'general', label: 'Ogólna opinia', icon: 'chatbubble-outline' },
    { id: 'bug', label: 'Zgłoszenie błędu', icon: 'bug-outline' },
    { id: 'feature', label: 'Sugestia funkcji', icon: 'bulb-outline' },
    { id: 'other', label: 'Inne', icon: 'help-circle-outline' },
  ];
  
  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Błąd', 'Proszę wprowadzić treść opinii');
      return;
    }
    
    if (feedbackType === 'general' && rating === null) {
      Alert.alert('Błąd', 'Proszę ocenić aplikację');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get user profile to attach user ID to feedback
      const profile = await getProfile();
      
      // Insert feedback into Supabase
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: profile?.id,
          type: feedbackType,
          content: feedbackText,
          rating: rating,
          created_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      Alert.alert(
        'Sukces',
        'Dziękujemy za Twoją opinię!',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      Alert.alert('Błąd', 'Wystąpił problem podczas wysyłania opinii. Spróbuj ponownie później.');
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setFeedbackType('general');
    setFeedbackText('');
    setRating(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Prześlij opinię',
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff'
      }} />
      
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rodzaj opinii</Text>
          
          <View style={styles.typeContainer}>
            {feedbackTypes.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.typeButton,
                  feedbackType === type.id && styles.typeButtonActive
                ]}
                onPress={() => setFeedbackType(type.id as FeedbackType)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={feedbackType === type.id ? '#fff' : '#666'} 
                />
                <Text style={[
                  styles.typeText,
                  feedbackType === type.id && styles.typeTextActive
                ]}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        
        {feedbackType === 'general' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oceń aplikację</Text>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={rating && star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={rating && star <= rating ? '#ff3b7f' : '#666'}
                  />
                </Pressable>
              ))}
            </View>
            
            <Text style={styles.ratingHint}>
              {rating ? `Twoja ocena: ${rating}/5` : 'Dotknij gwiazdki, aby ocenić'}
            </Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treść opinii</Text>
          
          <TextInput
            style={[styles.feedbackInput, { minHeight: 150 }]}
            placeholder={
              feedbackType === 'bug' 
                ? 'Opisz szczegółowo napotkany błąd...' 
                : feedbackType === 'feature'
                  ? 'Jaką funkcję chciałbyś zobaczyć w aplikacji?'
                  : 'Napisz swoją opinię...'
            }
            placeholderTextColor="#666"
            multiline
            value={feedbackText}
            onChangeText={setFeedbackText}
            textAlignVertical="top"
          />
        </View>
        
        <Pressable 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={submitFeedback}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  typeButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    margin: 5,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeButtonActive: {
    backgroundColor: '#ff3b7f',
    borderColor: '#ff3b7f',
  },
  typeText: {
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starButton: {
    padding: 10,
  },
  ratingHint: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  feedbackInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  submitButton: {
    backgroundColor: '#ff3b7f',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 