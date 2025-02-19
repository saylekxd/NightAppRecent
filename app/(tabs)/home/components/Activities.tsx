import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '@/lib/points';

interface ActivitiesProps {
  activities: Transaction[];
}

export function Activities({ activities }: ActivitiesProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {activities.slice(0, 5).map((activity) => (
        <View key={activity.id} style={styles.activityItem}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityAction}>{activity.description}</Text>
            <Text style={styles.activityDate}>
              {new Date(activity.created_at).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <Text style={[
            styles.activityPoints,
            { color: activity.type === 'earn' ? '#4CAF50' : '#ff3b7f' }
          ]}>
            {activity.type === 'earn' ? '+' : '-'}{activity.amount}
          </Text>
        </View>
      ))}
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
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
}); 