import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { getNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

interface NotificationBadgeProps {
  size?: number;
}

export const NotificationBadge = ({ size = 20 }: NotificationBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    
    const fetchUnreadCount = async () => {
      try {
        // Check if user is authenticated before fetching
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // User is not authenticated, don't try to fetch
          return;
        }
        
        const notifications = await getNotifications();
        if (isMounted) {
          const unread = notifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };
    
    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling
    interval = setInterval(fetchUnreadCount, 60000); // Update every minute
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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