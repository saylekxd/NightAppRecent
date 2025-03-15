import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  PressableProps, 
  ActivityIndicator, 
  StyleProp, 
  ViewStyle, 
  TextStyle 
} from 'react-native';

interface ButtonProps extends PressableProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({ 
  title, 
  isLoading = false, 
  variant = 'primary',
  size = 'medium',
  style, 
  textStyle,
  disabled,
  ...props 
}: ButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        styles[`${size}Size`],
        (disabled || isLoading) && styles.disabled,
        pressed && styles.pressed,
        style
      ]}
      disabled={disabled || isLoading}
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
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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