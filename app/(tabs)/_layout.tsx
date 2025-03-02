import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/auth';
import { router, useSegments } from 'expo-router';

// Get screen dimensions to help with positioning
const { height } = Dimensions.get('window');

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    checkAdmin();
  }, [segments]);

  const checkAdmin = async () => {
    try {
      const profile = await getProfile();
      setIsAdmin(profile.is_admin || false);
      
      // Check if we're in the admin section using segments
      const segmentsArray = segments as unknown as string[];
      // Only check admin section routes, not the admin tab itself
      const isInAdminSection = segmentsArray.some(segment => segment === '(admin)');
      if (!profile.is_admin && isInAdminSection) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setIsAdmin(false);
      const segmentsArray = segments as unknown as string[];
      // Only check admin section routes, not the admin tab itself
      const isInAdminSection = segmentsArray.some(segment => segment === '(admin)');
      if (isInAdminSection) {
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 80, // Increased height to extend to bottom
          paddingBottom: 28, // Increased padding to maintain the same visual top position
          paddingTop: 8,
          position: 'absolute',
          bottom: 0, // Position at the bottom of the screen
          left: 20,
          right: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          ...Platform.select({
            ios: {
              backgroundColor: 'rgba(26, 26, 26, 0.85)',
              borderTopWidth: 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            },
            android: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              borderTopWidth: 0,
              elevation: 8,
            },
            web: {
              backgroundColor: 'rgba(26, 26, 26, 0.9)',
              borderTopWidth: 0,
            },
          }),
        },
        tabBarBackground: Platform.OS === 'ios' ? () => (
          <BlurView
            tint="dark"
            intensity={80}
            style={[StyleSheet.absoluteFill, { 
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }]}
          />
        ) : undefined,
        tabBarActiveTintColor: '#ff3b7f',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'rewards') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'qr-code') {
            iconName = 'qr-code';
            // Special case for QR code - we'll handle it in the options
            return null;
          } else if (route.name === 'admin') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Główna',
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Nagrody',
        }}
      />
      <Tabs.Screen
        name="qr-code"
        options={{
          title: 'Mój QR',
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.qrButtonContainer}>
              <View style={[styles.qrButton, focused && styles.qrButtonFocused]}>
                <Ionicons name="qr-code" size={26} color={focused ? '#fff' : 'rgba(255, 255, 255, 0.9)'} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Panel',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  qrButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
    marginBottom: 20, // Added to adjust for the increased tab bar height
  },
  qrButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 59, 127, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff3b7f',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrButtonFocused: {
    backgroundColor: '#ff3b7f',
    transform: [{scale: 1.05}],
  },
});