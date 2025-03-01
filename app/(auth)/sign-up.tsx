import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signUp, SignUpData, signUpSchema } from '@/lib/auth';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    username?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      fullName?: string;
      username?: string;
    } = {};
    
    // Validate full name (max 16 characters)
    if (fullName.length > 16) {
      errors.fullName = 'Full name cannot exceed 16 characters';
    }
    
    // Validate username (required field)
    if (!username.trim()) {
      errors.username = 'Username is required';
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

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    // Clear validation error if it exists
    if (validationErrors.username) {
      setValidationErrors(prev => ({ ...prev, username: undefined }));
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);

      const data: SignUpData = { email, password, fullName, username };
      signUpSchema.parse(data);
      
      await signUp(data);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Utwórz Konto</Text>
        <Text style={styles.subtitle}>Dołącz do klubu</Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.fullName && styles.inputError]}
            placeholder="Imię i Nazwisko"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={handleFullNameChange}
            maxLength={16}
          />
          {validationErrors.fullName && (
            <Text style={styles.validationErrorText}>{validationErrors.fullName}</Text>
          )}
          <Text style={styles.characterCount}>{fullName.length}/16</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, validationErrors.username && styles.inputError]}
            placeholder="Nazwa użytkownika"
            placeholderTextColor="#666"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
          />
          {validationErrors.username && (
            <Text style={styles.validationErrorText}>{validationErrors.username}</Text>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Hasło"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.passwordRequirements}>
          Hasło musi zawierać co najmniej 8 znaków, w tym wielkie i małe litery, cyfry oraz znaki specjalne.
        </Text>

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Masz już konto?</Text>
          <Link href="/sign-in" style={styles.link}>
            <Text style={[styles.linkText, styles.signInText]}>Zaloguj się</Text>
          </Link>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 30,
  },
  error: {
    color: '#ff3b7f',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 5,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  validationErrorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 2,
  },
  characterCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
  },
  passwordRequirements: {
    color: '#fff',
    opacity: 0.6,
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#ff3b7f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#fff',
    opacity: 0.8,
    marginRight: 5,
  },
  link: {
    marginLeft: 5,
  },
  linkText: {
    color: '#ff3b7f',
    fontSize: 16,
  },
  signInText: {
    fontWeight: '600',
  },
});