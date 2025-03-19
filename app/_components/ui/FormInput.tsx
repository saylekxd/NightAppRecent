import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  label?: string;
  showCharCount?: boolean;
  maxLength?: number;
  isError?: boolean;
}

export const FormInput = ({ 
  icon, 
  error, 
  label, 
  showCharCount = false,
  maxLength,
  style,
  value = '',
  isError = false,
  ...props 
}: FormInputProps) => {
  // Add animation for error state
  const errorAnim = useRef(new Animated.Value(0)).current;
  // Add animation for character counter
  const counterAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (error || isError) {
      // Pulse animation for error state
      Animated.sequence([
        Animated.timing(errorAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(errorAnim, { toValue: 0.7, duration: 200, useNativeDriver: false }),
        Animated.timing(errorAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]).start();
    } else {
      // Reset to normal
      Animated.timing(errorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [error, isError]);
  
  // Animate counter visibility based on text length
  useEffect(() => {
    if (showCharCount && maxLength && value.length > 0) {
      Animated.timing(counterAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(counterAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [value.length, showCharCount, maxLength]);
  
  // Create interpolated colors for the glow effect
  const borderColorInterpolation = errorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#ff3b7f']
  });
  
  const backgroundColorInterpolation = errorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1a1a1a', 'rgba(255, 59, 127, 0.05)']
  });

  // Calculate percentage of maximum length for progress indication
  const percentage = maxLength ? Math.min(Math.round((value.length / maxLength) * 100), 100) : 0;
  // Determine color based on length progress
  const counterColor = 
    percentage < 50 ? '#666' : 
    percentage < 75 ? '#999' : 
    percentage < 90 ? '#ff9d00' : 
    '#ff3b7f';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputWrapper}>
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={error ? "#ff3b7f" : "#666"} 
            style={styles.icon} 
          />
        )}
        
        <Animated.View
          style={[
            styles.inputContainer,
            {
              borderColor: error || isError ? borderColorInterpolation : '#333',
              backgroundColor: error || isError ? backgroundColorInterpolation : '#1a1a1a',
            }
          ]}
        >
          <TextInput
            style={[
              styles.input,
              icon && styles.inputWithIcon,
              style
            ]}
            placeholderTextColor="#666"
            value={value}
            maxLength={maxLength}
            {...props}
          />
        </Animated.View>
      </View>
      
      <View style={styles.bottomRow}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          showCharCount && maxLength && (
            <Animated.View 
              style={[
                styles.charCountContainer,
                { opacity: counterAnim }
              ]}
            >
              {value.length > 0 && (
                <View style={styles.progressWrapper}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: counterColor
                      }
                    ]}
                  />
                </View>
              )}
              <Text style={[styles.charCount, { color: counterColor }]}>
                {value.length}/{maxLength}
              </Text>
            </Animated.View>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 14,
    opacity: 0.8,
  },
  inputWrapper: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 1,
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    padding: 15,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  inputWithIcon: {
    paddingLeft: 45,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  errorText: {
    color: '#ff3b7f',
    fontSize: 12,
    marginLeft: 4,
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  progressWrapper: {
    width: 30,
    height: 3,
    backgroundColor: 'rgba(102, 102, 102, 0.3)',
    borderRadius: 2,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
});

export default FormInput; 