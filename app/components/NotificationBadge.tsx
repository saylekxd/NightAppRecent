import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getNotifications } from '@/lib/notifications';

interface NotificationBadgeProps {
  size?: number;
}

export const NotificationBadge = ({ size = 20 }: NotificationBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await getNotifications();
        const unread = notifications.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // You could add a subscription or polling here to update in real-time
    const interval = setInterval(fetchUnreadCount, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (unreadCount === 0) {
    return null; // Don't render anything if there are no unread notifications
  }
  
  return (
    <View style={[
      styles.badge, 
      { width: size, height: size, borderRadius: size / 2 }
    ]}>
      <Text style={styles.badgeText}>
        {unreadCount > 9 ? '9+' : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ff3b7f',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 