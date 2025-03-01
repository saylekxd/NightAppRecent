import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  fullName: string;
  username: string;
  scrollY?: Animated.Value;
}

export function Header({ fullName, username, scrollY = new Animated.Value(0) }: HeaderProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
      })
    ]).start();
  }, []);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp'
  });

  return (
    <Animated.View 
      style={[
        styles.header,
        { transform: [{ translateY: headerTranslateY }] }
      ]}
    >
      <Animated.Image
        source={{ uri: 'https://rwxzctowvxylopuzpsti.supabase.co/storage/v1/object/sign/images/shine%20safe%20tonight%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvc2hpbmUgc2FmZSB0b25pZ2h0ICgxKS5wbmciLCJpYXQiOjE3NDA3NjY3ODAsImV4cCI6MTg5ODQ0Njc4MH0.nJIWVVaEZooPIMyiDjO1L08yuPOws6hiFTcRMhasH24' }}
        style={[styles.headerImage, { transform: [{ scale: 1.05 }] }]}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />
      <Animated.View 
        style={[
          styles.headerContent,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.welcomeText}>Witaj ponownie,</Text>
        <Text style={styles.nameText}>{fullName || username}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 200,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
}); 