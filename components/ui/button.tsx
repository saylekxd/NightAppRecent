import { Text, Pressable, PressableProps, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps extends PressableProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function Button({ 
  children, 
  variant = 'default',
  className,
  style,
  ...props 
}: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        style
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
          variant === 'ghost' && styles.ghostText,
        ]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#007AFF',
  },
}); 