import { View, Text, StyleSheet, TextInput, Pressable, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { getProfile, updateProfile, initiateAccountDeletion, checkDeletionStatus, cancelAccountDeletion } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState(false);
  const [deletionDate, setDeletionDate] = useState<Date | null>(null);

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
      
      // Check if account is pending deletion
      const { pendingDeletion, deletionDate } = await checkDeletionStatus();
      setPendingDeletion(pendingDeletion);
      if (deletionDate) {
        setDeletionDate(deletionDate);
      }
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
  
  const handleDeleteAccount = async () => {
    if (!password) {
      Alert.alert('Błąd', 'Proszę podać hasło');
      return;
    }
    
    try {
      setIsDeleting(true);
      setError(null);
      await initiateAccountDeletion(password);
      setDeleteModalVisible(false);
      // Refresh deletion status
      const { pendingDeletion, deletionDate } = await checkDeletionStatus();
      setPendingDeletion(pendingDeletion);
      if (deletionDate) {
        setDeletionDate(deletionDate);
      }
      Alert.alert(
        'Konto zaplanowane do usunięcia',
        'Twoje konto zostanie usunięte za 30 dni. Możesz anulować tę operację, logując się w ciągu tego okresu.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancelDeletion = async () => {
    try {
      setError(null);
      await cancelAccountDeletion();
      setPendingDeletion(false);
      setDeletionDate(null);
      Alert.alert(
        'Usunięcie konta anulowane',
        'Twoje konto nie zostanie usunięte.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
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
        
        {/* Danger Zone Section */}
        <View style={styles.dangerZone}>
          
          
          {pendingDeletion ? (
            <View style={styles.pendingDeletionContainer}>
              <Text style={styles.pendingDeletionText}>
                Twoje konto zostanie usunięte {deletionDate ? formatDate(deletionDate) : 'w ciągu 30 dni'}.
              </Text>
              <Pressable
                onPress={handleCancelDeletion}
                style={styles.cancelDeletionButton}>
                <Text style={styles.cancelDeletionButtonText}>Anuluj usunięcie konta</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setDeleteModalVisible(true)}
              style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.deleteButtonText}>Usuń konto</Text>
            </Pressable>
          )}
        </View>
      </View>
      
      {/* Delete Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Usuń konto</Text>
            
            <Text style={styles.modalText}>
              Aby potwierdzić usunięcie konta, wprowadź swoje hasło. Twoje konto zostanie zaplanowane do usunięcia za 30 dni.
              W tym czasie możesz zalogować się ponownie, aby anulować tę operację.
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Wprowadź hasło"
              placeholderTextColor="#666"
              secureTextEntry
            />
            
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setDeleteModalVisible(false);
                  setPassword('');
                }}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </Pressable>
              
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                style={[styles.confirmDeleteButton, isDeleting && styles.confirmDeleteButtonDisabled]}>
                <Text style={styles.confirmDeleteButtonText}>
                  {isDeleting ? 'Usuwanie...' : 'Usuń konto'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  // Danger Zone Styles
  dangerZone: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    color: '#ddd',
    marginBottom: 20,
    lineHeight: 22,
  },
  passwordInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#333',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#F44336',
    alignItems: 'center',
  },
  confirmDeleteButtonDisabled: {
    opacity: 0.7,
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Pending Deletion Styles
  pendingDeletionContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    padding: 15,
  },
  pendingDeletionText: {
    color: '#F44336',
    marginBottom: 15,
    textAlign: 'center',
  },
  cancelDeletionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelDeletionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});