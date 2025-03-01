import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { checkAdminStatus } from '@/lib/admin';

export default function AdminLayout() {
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const isAdmin = await checkAdminStatus();
      if (!isAdmin) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      router.replace('/(tabs)');
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="events" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="redeem" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="notifications-manager" />
    </Stack>
  );
}