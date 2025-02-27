import { View, Text, StyleSheet, ScrollView, Image, Animated, Pressable } from 'react-native';
import { Event } from '@/lib/events';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EventsProps {
  events: Event[];
}

export function Events({ events }: EventsProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nadchodzące Wydarzenia</Text>
      </View>
      
      <Animated.ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.eventsScroll}
        contentContainerStyle={styles.eventsScrollContainer}
        snapToInterval={295}
        decelerationRate={0.85}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      >
        {events.map((event, index) => {
          const inputRange = [
            (index - 1) * 295,
            index * 295,
            (index + 1) * 295
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.View 
              key={event.id} 
              style={[
                styles.eventCard,
                { transform: [{ scale }] }
              ]}
            >
              <Image source={{ uri: event.image_url }} style={styles.eventImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              />
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventDateDay}>
                  {new Date(event.date).getDate()}
                </Text>
                <Text style={styles.eventDateMonth}>
                  {new Date(event.date).toLocaleDateString('pl-PL', {
                    month: 'short'
                  })}
                </Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventLocation}>
                  <Ionicons name="location" size={14} color="#ff3b7f" />
                  <Text style={styles.eventLocationText}>
                    Szczegóły wydarzenia
                  </Text>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    display: 'none',
  },
  eventsScroll: {
    marginRight: -20,
    marginLeft: -20,
    paddingLeft: 20,
  },
  eventsScrollContainer: {
    paddingRight: 30,
    paddingVertical: 15,
  },
  eventCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 150,
  },
  eventDateBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 59, 127, 0.9)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 45,
  },
  eventDateDay: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDateMonth: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventLocationText: {
    color: '#fff',
    opacity: 0.8,
    marginLeft: 4,
    fontSize: 14,
  },
}); 