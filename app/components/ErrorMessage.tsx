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
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, message, fadeAnim, shakeAnim]);

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
      <MaterialIcons name="error-outline" size={20} color="#ff3b7f" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 127, 0.3)',
  },
  text: {
    color: '#ff3b7f',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
}); 