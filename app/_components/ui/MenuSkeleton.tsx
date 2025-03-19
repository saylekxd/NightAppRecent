import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

interface MenuSkeletonProps {
  count?: number;
}

export function MenuSkeleton({ count = 4 }: MenuSkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonItem = () => (
    <View style={styles.itemCard}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.description, { opacity }]} />
        <Animated.View style={[styles.price, { opacity }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeletonItem()}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 0,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  title: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 10,
    width: '70%',
  },
  description: {
    height: 16,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 15,
    width: '90%',
  },
  price: {
    height: 18,
    backgroundColor: '#333',
    borderRadius: 4,
    width: '30%',
  },
});

export default MenuSkeleton; 