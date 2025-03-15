import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { signIn, SignInData, signInSchema } from '@/lib/auth';
import { ZodError } from 'zod';
import { ErrorMessage } from '@/app/components/ErrorMessage';
import { FormInput } from '@/app/components/FormInput';
import { Button } from '@/app/components/Button';
import { Pressable } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSignIn = async () => {
    try {
      // Clear previous errors
      setError(null);
      setFieldErrors({});
      setIsLoading(true);

      const data: SignInData = { email, password };
      signInSchema.parse(data);
      
      await signIn(data);
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
          }
          
          return acc;
        }, {} as { email?: string; password?: string });
        
        setFieldErrors(formattedErrors);
        setError('Proszę poprawić błędy w formularzu');
      } else if (err instanceof Error) {
        // Check for common auth errors
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('invalid') && 
            (errorMessage.includes('email') || errorMessage.includes('password'))) {
          setError('Nieprawidłowy email lub hasło');
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          setError('Problem z połączeniem internetowym. Spróbuj ponownie.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Wystąpił nieznany błąd');
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/nigthzonelogo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitle}>Zaloguj się, aby kontynuować</Text>

          <ErrorMessage message={error} visible={!!error} />

          <FormInput
            icon="email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            error={fieldErrors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormInput
            icon="lock"
            placeholder="Hasło"
            value={password}
            onChangeText={setPassword}
            error={fieldErrors.password}
            secureTextEntry
          />

          <Button
            title={isLoading ? 'Logowanie...' : 'Zaloguj się'}
            onPress={handleSignIn}
            isLoading={isLoading}
            size="large"
            style={styles.button}
          />

          <Link href="/reset-password" style={styles.forgotPasswordLink}>
            <Text style={styles.linkText}>Zapomniałeś hasła?</Text>
          </Link>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Nie masz konta?</Text>
            <Link href="/sign-up" style={styles.link}>
              <Text style={styles.linkText}>Zarejestruj się</Text>
            </Link>
          </View>
          
          <View style={styles.legalLinksContainer}>
            <Link href="https://www.nocklub.com/prawne/polityka-prywatnosci" asChild>
              <Pressable style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Polityka prywatności</Text>
              </Pressable>
            </Link>
            <Text style={styles.legalLinkDivider}>•</Text>
            <Link href="https://www.nocklub.com/prawne/regulamin" asChild>
              <Pressable style={styles.legalLink}>
                <Text style={styles.legalLinkText}>Warunki użytkowania</Text>
              </Pressable>
            </Link>
          </View>
        </View>
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
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 240,
    height: 80,
    shadowColor: '#ff3b7f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
  button: {
    marginTop: 10,
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignSelf: 'center',
  },
  link: {
    marginLeft: 5,
  },
  linkText: {
    color: '#ff3b7f',
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
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  legalLink: {
    marginHorizontal: 5,
  },
  legalLinkText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalLinkDivider: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginHorizontal: 5,
  },
});