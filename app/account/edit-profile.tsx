import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { getProfile, updateProfile, requestAccountDeletion } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
  }>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      const profile = await getProfile();
      setFullName(profile.full_name || '');
      
      // Get user email from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const validateForm = (): boolean => {
    const errors: {
      fullName?: string;
    } = {};
    
    // Validate full name (max 16 characters)
    if (fullName.length > 16) {
      errors.fullName = 'Pełne imię nie może przekraczać 16 znaków.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFullNameChange = (text: string) => {
    // Limit input to 16 characters
    if (text.length <= 16) {
      setFullName(text);
    }
    // Clear validation error if it exists
    if (validationErrors.fullName) {
      setValidationErrors(prev => ({ ...prev, fullName: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setError(null);
      setSaving(true);
      await updateProfile({
        full_name: fullName,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      // Use the centralized function from auth.ts
      await requestAccountDeletion();

      Alert.alert(
        "Usunięcie konta zaplanowane",
        "Twoje konto zostanie usunięte za 14 dni. Możesz anulować ten proces, logując się ponownie przed upływem tego terminu.",
        [
          { 
            text: "OK", 
            onPress: async () => {
              try {
                // Sign the user out
                await supabase.auth.signOut();
                // Redirect to authentication screen or main screen
                router.replace('/');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to sign out');
              }
            } 
          }
        ]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during account deletion request');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Usuń konto",
      "Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna i wszystkie Twoje dane zostaną usunięte po 14 dniach.",
      [
        { text: "Anuluj", style: "cancel" },
        { text: "Usuń konto", style: "destructive", onPress: handleAccountDeletion }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        
        <Text style={styles.title}>Edytuj profil</Text>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, validationErrors.fullName && styles.inputError]}
            value={fullName}
            onChangeText={handleFullNameChange}
            placeholder="Wpisz swój nickname"
            placeholderTextColor="#666"
            maxLength={16}
          />
          {validationErrors.fullName && (
            <Text style={styles.validationErrorText}>{validationErrors.fullName}</Text>
          )}
          <Text style={styles.characterCount}>{fullName.length}/16</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          <Text style={styles.helperText}>Zmiana adresu email jest niemożliwa</Text>
        </View>
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Niebezpieczna strefa</Text>
        <View style={styles.deleteContainer}>
          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}>
            <Text style={styles.deleteButtonText}>
              {isDeleting ? 'Usuwanie...' : 'Usuń konto'}
            </Text>
          </Pressable>
          <Text style={styles.deleteDescription}>
            To spowoduje nieodwracalne usunięcie Twojego konta i wszystkich danych po 14 dniach. \n Możesz anulować ten proces, logując się ponownie przed upływem tego terminu.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  disabledInput: {
    backgroundColor: '#111',
    borderColor: '#222',
  },
  emailText: {
    color: '#999',
  },
  helperText: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  inputError: {
    borderColor: '#F44336',
  },
  validationErrorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 5,
  },
  characterCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  dangerZone: {
    marginTop: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  dangerZoneTitle: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  deleteContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 15,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
});