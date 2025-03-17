import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorMessageProps {
  message: string | null;
  visible: boolean;
}

export const ErrorMessage = ({ message, visible }: ErrorMessageProps) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [shakeAnim] = React.useState(new Animated.Value(0));
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (visible && message) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true, easing: Easing.bounce }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true, easing: Easing.bounce }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true, easing: Easing.bounce }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true, easing: Easing.bounce }),
      ]).start();
      
      // Start pulsing animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Stop pulsing animation
      pulseAnim.setValue(1);
    }
  }, [visible, message, fadeAnim, shakeAnim, pulseAnim]);

  if (!visible || !message) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          transform: [{ translateX: shakeAnim }] 
        }
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <MaterialIcons name="error-outline" size={24} color="#ff3b7f" />
      </Animated.View>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 127, 0.15)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 127, 0.4)',
    shadowColor: '#ff3b7f',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: '#ff3b7f',
    marginLeft: 12,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
}); 