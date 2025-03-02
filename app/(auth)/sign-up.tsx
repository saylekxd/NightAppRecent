import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Animated, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signUp, SignUpData, signUpSchema } from '@/lib/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { ZodError } from 'zod';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const shakeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = (): boolean => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
    } = {};
    let isValid = true;
    
    // Validate full name (max 16 characters)
    if (!fullName.trim()) {
      errors.fullName = 'Imię i nazwisko jest wymagane';
      isValid = false;
    } else if (fullName.length > 16) {
      errors.fullName = 'Imię i nazwisko nie może przekraczać 16 znaków';
      isValid = false;
    }
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email jest wymagany';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Nieprawidłowy format email';
      isValid = false;
    }
    
    // Password validation
    if (!password.trim()) {
      errors.password = 'Hasło jest wymagane';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Hasło musi mieć co najmniej 8 znaków';
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Hasło musi zawierać wielką literę';
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Hasło musi zawierać małą literę';
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Hasło musi zawierać cyfrę';
      isValid = false;
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = 'Hasło musi zawierać znak specjalny';
      isValid = false;
    }
    
    setFieldErrors(errors);
    
    if (!isValid) {
      startShake();
    }
    
    return isValid;
  };

  const handleFullNameChange = (text: string) => {
    // Limit input to 16 characters
    if (text.length <= 16) {
      setFullName(text);
    }
    // Clear validation error if it exists
    if (fieldErrors.fullName) {
      setFieldErrors(prev => ({ ...prev, fullName: undefined }));
    }
    setError(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
    setError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
    setError(null);
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);

      const data: SignUpData = { email, password, fullName };
      signUpSchema.parse(data);
      
      await signUp(data);
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof ZodError) {
        // Handle validation errors from Zod
        const formattedErrors = err.errors.reduce((acc, error) => {
          const field = error.path[0] as string;
          
          if (field === 'email') {
            acc.email = error.message;
          } else if (field === 'password') {
            acc.password = error.message;
          } else if (field === 'fullName') {
            acc.fullName = error.message;
          }
          
          return acc;
        }, {} as { email?: string; password?: string; fullName?: string });
        
        setFieldErrors(formattedErrors);
        setError('Proszę poprawić błędy w formularzu');
        startShake();
      } else if (err instanceof Error) {
        // Handle specific errors
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('email') && errorMessage.includes('already')) {
          setError('Ten adres email jest już używany');
          setFieldErrors(prev => ({ ...prev, email: 'Email już istnieje w systemie' }));
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setError('Problem z połączeniem internetowym. Spróbuj ponownie.');
        } else if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
          setError('Zbyt wiele prób rejestracji. Spróbuj później.');
        } else {
          setError(err.message || 'Wystąpił nieznany błąd podczas rejestracji');
        }
        
        startShake();
      } else {
        setError('Wystąpił nieznany błąd podczas rejestracji');
        startShake();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/nigthzonelogo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerContainer}>
            <Text style={styles.subtitle}>Dołącz do klubu</Text>
          </View>

          {error && (
            <Animated.View 
              style={[
                styles.errorContainer,
                { transform: [{ translateX: shakeAnim }] }
              ]}
            >
              <MaterialIcons name="error-outline" size={20} color="#ff3b7f" />
              <Text style={styles.error}>{error}</Text>
            </Animated.View>
          )}

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color={fieldErrors.fullName ? "#ff3b7f" : "#666"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, fieldErrors.fullName && styles.inputError]}
                placeholder="Imię i Nazwisko"
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={handleFullNameChange}
                maxLength={16}
              />
              {fieldErrors.fullName ? (
                <Text style={styles.fieldErrorText}>{fieldErrors.fullName}</Text>
              ) : (
                <Text style={styles.characterCount}>{fullName.length}/16</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={fieldErrors.email ? "#ff3b7f" : "#666"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, fieldErrors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={handleEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {fieldErrors.email && (
                <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color={fieldErrors.password ? "#ff3b7f" : "#666"} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, fieldErrors.password && styles.inputError]}
                placeholder="Hasło"
                placeholderTextColor="#666"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
              />
              {fieldErrors.password && (
                <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
              )}
            </View>

            <Text style={styles.passwordRequirements}>
              Hasło musi zawierać co najmniej 8 znaków, w tym wielkie i małe litery, cyfry oraz znaki specjalne.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                isLoading && styles.buttonDisabled,
                pressed && styles.buttonPressed
              ]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Zarejestruj się</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Masz już konto?</Text>
            <Link href="/sign-in" style={styles.link}>
              <Text style={styles.linkText}>Zaloguj się</Text>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: -20,
  },
  logo: {
    width: 240,
    height: 80,
    shadowColor: '#ff3b7f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  formContainer: {
    marginVertical: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  error: {
    color: '#ff3b7f',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    paddingLeft: 45,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b7f',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 59, 127, 0.05)',
  },
  fieldErrorText: {
    color: '#ff3b7f',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 10,
  },
  characterCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  passwordRequirements: {
    color: '#fff',
    opacity: 0.6,
    fontSize: 13,
    marginBottom: 24,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#ff3b7f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ff3b7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    backgroundColor: '#e03571',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
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
    fontSize: 16,
  },
  link: {
    marginLeft: 5,
  },
  linkText: {
    color: '#ff3b7f',
    fontSize: 16,
    fontWeight: 'bold',
  },
});