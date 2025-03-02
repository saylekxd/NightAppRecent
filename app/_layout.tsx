import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { getSession } from '@/lib/auth';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/lib/notifications';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://ad85134147796cd5eb122b85cf998068@o4508910073348096.ingest.de.sentry.io/4508910077083728',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

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
          // Always show onboarding first when not authenticated
          router.replace('/onboarding');
        } else if (session && inAuthGroup) {
          // Redirect to home if already authenticated
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth error:', error);
        router.replace('/onboarding');
      }
    };

    // Only run auth check if segments are available
    if (segments.length > 0) {
      checkAuth();
    }
  }, [segments]);

  return (
    <>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </View>
      <Toast config={toastConfig} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});