import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Transaction } from '@/lib/points';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface ActivitiesProps {
  activities: Transaction[];
}

export function Activities({ activities }: ActivitiesProps) {
  const fadeAnim = useRef(activities.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (activities.length === 0) return;
    
    const animations = fadeAnim.map((anim, i) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * 100,
        useNativeDriver: true,
      });
    });
    
    Animated.stagger(100, animations).start();
  }, [activities]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ostatnia aktywność</Text>
      </View>
      
      {activities.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="qr-code-outline" size={48} color="#ff3b7f" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateTitle}>Brak aktywności</Text>
          <Text style={styles.emptyStateMessage}>
            Zeskanuj swój pierwszy kod QR, aby rozpocząć zbieranie punktów.
          </Text>
        </View>
      ) : (
        <View style={styles.activitiesContainer}>
          {activities.slice(0, 5).map((activity, index) => (
            <Animated.View 
              key={activity.id} 
              style={[
                styles.activityItem,
                { opacity: fadeAnim[index], transform: [{ translateY: fadeAnim[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}] }
              ]}
            >
              <View style={styles.activityIconContainer}>
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: activity.type === 'earn' ? 'rgba(255, 59, 127, 0.1)' : 'rgba(204, 204, 204, 0.1)' }
                ]}>
                  <Ionicons 
                    name={activity.type === 'earn' ? 'arrow-up' : 'arrow-down'} 
                    size={16} 
                    color={activity.type === 'earn' ? '#ff3b7f' : '#cccccc'} 
                  />
                </View>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>{activity.description}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.created_at).toLocaleDateString('pl-PL', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={[
                styles.activityPoints,
                { color: activity.type === 'earn' ? '#ff3b7f' : '#cccccc' }
              ]}>
                {activity.type === 'earn' ? '+' : '-'}{activity.amount}
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
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
  activitiesContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(51, 51, 51, 0.7)',
    marginVertical: 5,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    color: '#fff',
    fontSize: 16,
  },
  activityDate: {
    color: '#fff',
    opacity: 0.6,
    fontSize: 14,
    marginTop: 4,
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateMessage: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
}); 