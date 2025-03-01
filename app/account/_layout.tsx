import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { router } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              padding: 8,
            })}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        ),
      }}>
      <Stack.Screen
        name="edit-profile"
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="avatar"
        options={{
          title: 'Choose Avatar',
        }}
      />
    </Stack>
  );
}