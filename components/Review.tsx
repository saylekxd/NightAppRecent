import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { canSubmitReview, hasRecentTransaction, hasRecentReview } from '@/lib/reviews';

interface ReviewProps {
  onReviewSubmitted?: () => void;
}

export const Review = ({ onReviewSubmitted }: ReviewProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [submittedMood, setSubmittedMood] = useState<number | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Get the current user and check if they can submit a review
    const checkUserStatus = async () => {
      setIsChecking(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        console.log('Current user:', user?.id);

        if (user) {
          // Check for recent transactions first
          const hasTransaction = await hasRecentTransaction();
          console.log('Has recent transaction:', hasTransaction);
          
          // Check for recent reviews
          const hasReview = await hasRecentReview();
          console.log('Has recent review:', hasReview);
          
          // Get the final result
          const result = await canSubmitReview();
          console.log('Can submit review result:', result);
          
          setCanSubmit(result.canSubmit);
          setBlockReason(result.reason || null);
        } else {
          setCanSubmit(false);
          setBlockReason('You must be logged in to submit a review');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setCanSubmit(false);
        setBlockReason('An error occurred while checking your status');
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, []);

  // Run animation when justSubmitted changes to true
  useEffect(() => {
    if (justSubmitted) {
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [justSubmitted, fadeAnim, scaleAnim]);

  const moods = [
    { value: 1, icon: 'sad-outline', label: 'Very Unhappy' },
    { value: 2, icon: 'sad', label: 'Unhappy' },
    { value: 3, icon: 'happy-outline', label: 'Neutral' },
    { value: 4, icon: 'happy', label: 'Happy' },
    { value: 5, icon: 'heart', label: 'Very Happy' },
  ];

  const handleSubmit = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Proszę wybrać nastrój przed wysłaniem opinii');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Aby dodać recenzję, musisz być zalogowany');
      return;
    }

    if (!canSubmit) {
      Alert.alert('Error', blockReason || 'Obecnie nie możesz dodać recenzji');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        mood: selectedMood,
        comment: comment.trim() || null,
      });

      if (error) {
        throw error;
      }

      // Save the submitted mood for the success screen
      setSubmittedMood(selectedMood);
      setJustSubmitted(true);
      
      // Reset form
      setSelectedMood(null);
      setComment('');
      setCanSubmit(false);
      setBlockReason('Już dodałeś recenzję w ciągu ostatnich 24 godzin');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Nie udało się dodać recenzji. Proszę spróbować ponownie');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff3b7f" />
        <Text style={styles.loadingText}>Sprawdzamy, czy możesz dodać recenzję...</Text>
      </View>
    );
  }

  if (justSubmitted) {
    const moodIcon = submittedMood ? moods.find(m => m.value === submittedMood)?.icon : 'heart';
    return (
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.successContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={50} color="#ff3b7f" />
          <Text style={styles.successTitle}>Thank You for Your Feedback!</Text>
          <View style={styles.submittedMoodContainer}>
            <Ionicons 
              name={moodIcon as any} 
              size={40} 
              color="#ffffff" 
            />
          </View>
          <Text style={styles.successMessage}>
            Twoja opinia jest dla nas ważna i pomaga nam ulepszać nasze usługi!
          </Text>
          <Text style={styles.successSubtext}>
            Będziesz mógł dodać kolejną recenzję za 24 godziny
          </Text>
        </Animated.View>
      </View>
    );
  }

  if (!canSubmit) {
    // Different UI based on the reason for blocking
    if (blockReason && blockReason.includes('already submitted')) {
      return (
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.successContainer,
              {
                opacity: 1, // No animation for this state
                transform: [{ scale: 1 }]
              }
            ]}
          >
            <Ionicons name="checkmark-circle" size={50} color="#ff3b7f" />
            <Text style={styles.successTitle}>Dziękujemy!</Text>
            <Text style={styles.successMessage}>
              Już podzieliłeś się z nami swoją opinią w ciągu ostatnich 24 godzin.
Dziękujemy za Twój wkład – pomagasz nam ulepszać nasze usługi!
            </Text>
            <Text style={styles.successSubtext}>
              Będziesz mógł dodać kolejną recenzję 24 godziny po ostatnim wypełnieniu
            </Text>
          </Animated.View>
        </View>
      );
    } else if (blockReason && blockReason.includes('transaction')) {
      return (
        <View style={styles.container}>
          <View style={styles.blockedContainer}>
            <Ionicons name="time-outline" size={40} color="#ff3b7f" />
            <Text style={styles.blockedTitle}>Ankieta jeszcze niedostępna</Text>
            <Text style={styles.blockedMessage}>
              {blockReason}
            </Text>
            <Text style={styles.blockedSubtext}>
              Odwiedź nas wkrótce, aby podzielić się swoim doświadczeniem!
            </Text>
          </View>
        </View>
      );
    } else {
      // Default blocked state
      return (
        <View style={styles.container}>
          <View style={styles.blockedContainer}>
            <Ionicons name="lock-closed" size={40} color="#ff3b7f" />
            <Text style={styles.blockedTitle}>Ankieta niedostępna</Text>
            <Text style={styles.blockedMessage}>{blockReason}</Text>
          </View>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jak Ci się podoba impreza?</Text>
      
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && styles.selectedMood,
            ]}
            onPress={() => setSelectedMood(mood.value)}
            disabled={isSubmitting}
          >
            <Ionicons
              name={mood.icon as any}
              size={32}
              color={selectedMood === mood.value ? '#ff3b7f' : '#ffffff'}
            />
            <Text
              style={[
                styles.moodLabel,
                selectedMood === mood.value && styles.selectedMoodLabel,
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Share your thoughts (optional)"
        placeholderTextColor="#888"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedMood || isSubmitting) && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={!selectedMood || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Zatwierdzanie...' : 'Zatwierdź opinię'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 150,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
  },
  blockedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  blockedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b7f',
    marginTop: 12,
    marginBottom: 8,
  },
  blockedMessage: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#fff',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedMood: {
    backgroundColor: '#333',
  },
  moodLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#fff',
  },
  selectedMoodLabel: {
    color: '#ff3b7f',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#222',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ff3b7f',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff3b7f',
    marginTop: 12,
    marginBottom: 8,
  },
  successMessage: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  successSubtext: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  blockedSubtext: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  submittedMoodContainer: {
    backgroundColor: '#ff3b7f',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
}); 