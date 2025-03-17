import React, { useState } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  PressableProps, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle,
  Animated,
  Platform
} from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  errorState?: boolean;
}

export const Button = ({ 
  title, 
  isLoading = false, 
  variant = 'primary',
  size = 'medium',
  style, 
  textStyle,
  disabled,
  errorState = false,
  ...props 
}: ButtonProps) => {
  const [pressAnimation] = useState(new Animated.Value(1));
  
  // Animation for press in/out
  const handlePressIn = () => {
    Animated.spring(pressAnimation, {
      toValue: 0.95,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(pressAnimation, {
      toValue: 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pressAnimation }] }}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles[variant],
          styles[`${size}Size`],
          (disabled || isLoading) && styles.disabled,
          pressed && styles.pressed,
          errorState && styles.errorState,
          style
        ]}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={variant !== 'outline' ? {
          color: 'rgba(255, 255, 255, 0.3)',
          borderless: false,
          radius: -1
        } : undefined}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator 
            color={variant === 'outline' ? '#ff3b7f' : '#fff'} 
            size="small" 
          />
        ) : (
          <Text 
            style={[
              styles.text, 
              styles[`${variant}Text`],
              styles[`${size}Text`],
              textStyle
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Important for Android ripple
  },
  primary: {
    backgroundColor: '#ff3b7f',
    shadowColor: '#ff3b7f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondary: {
    backgroundColor: '#333',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff3b7f',
  },
  smallSize: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumSize: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeSize: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  disabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: Platform.OS === 'ios' ? 0.85 : 1, // We're using ripple for Android
  },
  errorState: {
    backgroundColor: '#E53935', // Red color for error state
    borderColor: '#E53935',
  },
  text: {
    fontWeight: 'bold',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#ff3b7f',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
}); 