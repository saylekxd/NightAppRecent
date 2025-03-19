import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Dimensions, Animated, Easing } from 'react-native';
import { getPromotionPhotos, Photo } from '@/lib/photos';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Types for star animation
interface StarPosition {
  x: number;
  y: number;
}

interface StarProps {
  size: number;
  position: StarPosition;
  delay: number;
}

interface StarData {
  id: number;
  position: StarPosition;
  size: number;
  delay: number;
}

// Star component for animation
const Star = ({ size, position, delay }: StarProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animation sequence for twinkling effect
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: Math.random() * 0.7 + 0.3, // Random opacity between 0.3 and 1
            duration: 1000 + Math.random() * 1000, // Random duration
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scale, {
            toValue: Math.random() * 0.5 + 0.5, // Random scale between 0.5 and 1
            duration: 1000 + Math.random() * 1000,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: Math.random() * 0.3, // Random low opacity
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scale, {
            toValue: Math.random() * 0.3 + 0.2, // Random small scale
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: position.x,
          top: position.y,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Ionicons name="star" size={size} color="#fff" />
    </Animated.View>
  );
};

// Generate random positions for stars
const generateStars = (count: number, containerWidth: number, containerHeight: number): StarData[] => {
  const stars: StarData[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      position: {
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
      },
      size: Math.random() * 10 + 5, // Random size between 5 and 15
      delay: Math.random() * 2000, // Random delay for animation start
    });
  }
  return stars;
};

export const PromotionPhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPromotionPhotos();
      setPhotos(data);
    } catch (err) {
      console.error('Error loading promotion photos:', err);
      setError('Nie udało się załadować zdjęć promocyjnych');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Promocje</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff3b7f" />
          <Text style={styles.loadingText}>Ładowanie zdjęć promocyjnych...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Promocje</Text>
          <Pressable onPress={loadPhotos}>
            <Ionicons name="refresh" size={24} color="#ff3b7f" />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={32} color="#ff3b7f" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadPhotos}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Promocje</Text>
          <Pressable onPress={loadPhotos}>
            <Ionicons name="refresh" size={24} color="#ff3b7f" />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={32} color="#666" />
          <Text style={styles.emptyText}>Brak zdjęć promocyjnych</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Promocje</Text>
        <Pressable onPress={loadPhotos}>
          <Ionicons name="refresh" size={24} color="#ff3b7f" />
        </Pressable>
      </View>

      {/* Vertical list of photos */}
      <View style={styles.photoContainer}>
        {photos.map((photo) => {
          // Generate stars for each photo
          const cardStars = generateStars(15, width - 40, 200);
          
          return (
            <View 
              key={photo.id} 
              style={styles.photoCard}
            >
              <Image 
                source={{ uri: photo.url }} 
                style={styles.photo} 
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              />
              
              {/* Stars overlay */}
              <View style={styles.starsContainer}>
                {cardStars.map(star => (
                  <Star 
                    key={`${photo.id}-star-${star.id}`}
                    size={star.size}
                    position={star.position}
                    delay={star.delay}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoCard: {
    width: width - 40,
    height: 200,
    position: 'relative',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    borderRadius: 15,
  },
  starsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 15,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  errorText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ff3b7f',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
});

export default PromotionPhotos; 