import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Star component for the floating animation
const AnimatedStar = ({ 
  delay, 
  duration, 
  startPosition, 
  size, 
  color 
}: { 
  delay: number; 
  duration: number; 
  startPosition: { x: number; y: number }; 
  size: number;
  color: string;
}) => {
  const positionY = useRef(new Animated.Value(startPosition.y)).current;
  const positionX = useRef(new Animated.Value(startPosition.x)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: startPosition.y - 60,
          duration: duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(positionX, {
          toValue: startPosition.x + (Math.random() * 30 - 15),
          duration: duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(duration * 0.7),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.3,
            useNativeDriver: true,
          })
        ])
      ])
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [
          { translateX: positionX },
          { translateY: positionY },
          { scale: scale }
        ],
        opacity: opacity,
      }}
    >
      <Ionicons name="star" size={size} color={color} />
    </Animated.View>
  );
};

export function LoadingAnimation() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [stars, setStars] = useState<Array<{ id: number; delay: number; duration: number; position: { x: number; y: number }; size: number }>>([]);
  const starsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextStarId = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start pulsing animation for the moon
    startPulseAnimation();
    
    // Start generating stars
    startGeneratingStars();
    
    // Fade in the loading text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    return () => {
      if (starsTimerRef.current) {
        clearInterval(starsTimerRef.current);
      }
    };
  }, []);

  const startGeneratingStars = () => {
    // Generate initial stars
    const initialStars = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      
      initialStars.push({
        id: nextStarId.current++,
        delay: i * 200,
        duration: 1500 + Math.random() * 1000,
        position: { 
          x: Math.cos(angle) * distance, 
          y: Math.sin(angle) * distance 
        },
        size: 8 + Math.random() * 8
      });
    }
    setStars(initialStars);
    
    // Generate a new star every 800-1500ms
    starsTimerRef.current = setInterval(() => {
      const angle = Math.random() * Math.PI * 2; // Random angle around the circle
      const distance = 30 + Math.random() * 40; // Distance from center
      
      // Calculate position based on angle and distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      const newStar = {
        id: nextStarId.current++,
        delay: Math.random() * 200,
        duration: 1500 + Math.random() * 1000,
        position: { x, y },
        size: 6 + Math.random() * 8
      };
      
      setStars(prevStars => {
        // Keep only the last 10 stars to avoid too many animations
        const updatedStars = [...prevStars, newStar];
        if (updatedStars.length > 10) {
          return updatedStars.slice(updatedStars.length - 10);
        }
        return updatedStars;
      });
    }, 800 + Math.random() * 700);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  return (
    <View style={styles.loadingContainer}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.moonContainer}>
        <View style={styles.starsContainer}>
          {stars.map(star => (
            <AnimatedStar 
              key={star.id}
              delay={star.delay}
              duration={star.duration}
              startPosition={star.position}
              size={star.size}
              color="#ffffff"
            />
          ))}
        </View>
        
        <Animated.View 
          style={[
            styles.moon,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Ionicons name="moon" size={60} color="#ffffff" />
        </Animated.View>
      </View>
      
      <Animated.Text 
        style={[
          styles.loadingText,
          { opacity: fadeAnim }
        ]}
      >
        Ładowanie...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  moonContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  moon: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
});

export default LoadingAnimation; 