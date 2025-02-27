import { View, Text, StyleSheet, Image } from 'react-native';

interface HeaderProps {
  fullName: string;
  username: string;
}

export function Header({ fullName, username }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800' }}
        style={styles.headerImage}
      />
      <View style={styles.overlay} />
      <View style={styles.headerContent}>
        <Text style={styles.welcomeText}>Witaj ponownie,</Text>
        <Text style={styles.nameText}>{fullName || username}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
}); 