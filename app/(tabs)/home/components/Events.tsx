import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Event } from '@/lib/events';

interface EventsProps {
  events: Event[];
}

export function Events({ events }: EventsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.eventsScroll}
        contentContainerStyle={styles.eventsScrollContainer}
      >
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Image source={{ uri: event.image_url }} style={styles.eventImage} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventsScroll: {
    marginRight: -20,
    marginLeft: -20,
    paddingLeft: 20,
  },
  eventsScrollContainer: {
    paddingRight: 20,
  },
  eventCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
}); 