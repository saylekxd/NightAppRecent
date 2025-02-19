import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signUp, SignUpData, signUpSchema } from '@/lib/auth';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const data: SignUpData = { email, password, fullName };
      signUpSchema.parse(data);
      
      await signUp(data);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the club</Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={fullName}
          onChangeText={setFullName}
        />

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
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.passwordRequirements}>
          Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
        </Text>

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/sign-in" style={styles.link}>
            <Text style={[styles.linkText, styles.signInText]}>Sign In</Text>
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
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
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