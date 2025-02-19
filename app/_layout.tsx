import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { getSession } from '@/lib/auth';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        const inAuthGroup = segments[0] === '(auth)';

        if (!session && !inAuthGroup) {
          // Redirect to sign-in if not authenticated
          router.replace('/sign-in');
        } else if (session && inAuthGroup) {
          // Redirect to home if already authenticated
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.replace('/sign-in');
      }
    };

    // Only run auth check if segments are available
    if (segments.length > 0) {
      checkAuth();
    }
  }, [segments]);

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});