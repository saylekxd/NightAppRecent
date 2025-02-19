import { View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import { Link, router } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PagerView from 'react-native-pager-view';
import { onboardingImages } from '@/assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    title: 'Welcome to NightApp',
    description: 'Your ultimate companion for nightlife and community events',
    image: onboardingImages['onboarding-1'],
  },
  {
    title: 'Discover Events',
    description: 'Find exciting events and connect with your community',
    image: onboardingImages['onboarding-2'],
  },
  {
    title: 'Join the Community',
    description: 'Create and share memorable experiences with others',
    image: onboardingImages['onboarding-3'],
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
      >
        {onboardingData.map((item, index) => (
          <Animated.View 
            key={index}
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.pageContainer}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={item.image}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        ))}
      </PagerView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentPage === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentPage < onboardingData.length - 1 ? (
            <Button
              variant="default"
              onPress={() => pagerRef.current?.setPage(currentPage + 1)}
              className="w-full bg-primary"
            >
              Next
            </Button>
          ) : (
            <Button 
              className="w-full bg-primary"
              onPress={handleComplete}
            >
              Get Started
            </Button>
          )}
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
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
  buttonContainer: {
    width: '100%',
  },
}); 