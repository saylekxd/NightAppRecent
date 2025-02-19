import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaceholderImageProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export function PlaceholderImage({ 
  iconName = "images-outline",
  size = 80,
  color = "#333"
}: PlaceholderImageProps) {
  return (
    <View style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
      <Ionicons name={iconName} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 