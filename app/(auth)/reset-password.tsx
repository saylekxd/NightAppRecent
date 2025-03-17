import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword } from '@/lib/auth';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setError(null);
      setIsLoading(true);

      await resetPassword(email);
      setSuccess(true);
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
      
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Resetowanie hasła</Text>
        <Text style={styles.subtitle}>
          Podaj swój adres email, a wyślemy Ci instrukcje resetowania hasła.
        </Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Sprawdź swoją skrzynkę email, aby znaleźć instrukcje resetowania hasła.
            </Text>
            <Link href="/sign-in" style={styles.link}>
              <Text style={styles.linkText}>Wróć do logowania</Text>
            </Link>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Wysyłanie...' : 'Wyślij instrukcje resetowania'}
              </Text>
            </Pressable>

            <Link href="/sign-in" style={styles.link}>
              <Text style={styles.linkText}>Powrót do logowania</Text>
            </Link>
          </>
        )}
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
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    marginTop: -40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 30,
    lineHeight: 24,
  },
  error: {
    color: '#ff3b7f',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 8,
  },
  successContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
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
  link: {
    marginTop: 20,
    alignSelf: 'center',
  },
  linkText: {
    color: '#ff3b7f',
    fontSize: 16,
  },
});