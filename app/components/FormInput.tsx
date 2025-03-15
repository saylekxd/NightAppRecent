import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  label?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const FormInput = ({ 
  icon, 
  error, 
  label, 
  showCharCount = false,
  maxLength,
  style,
  value = '',
  ...props 
}: FormInputProps) => {
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
        
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            error && styles.inputError,
            style
          ]}
          placeholderTextColor="#666"
          value={value}
          maxLength={maxLength}
          {...props}
        />
      </View>
      
      <View style={styles.bottomRow}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          showCharCount && maxLength && (
            <Text style={styles.charCount}>
              {value.length}/{maxLength}
            </Text>
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
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 45,
  },
  inputError: {
    borderColor: '#ff3b7f',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 59, 127, 0.05)',
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
  charCount: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
  },
}); 