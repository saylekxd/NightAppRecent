import { supabase } from './supabase';
import { Notification } from './notifications';

// This file simulates an external server sending notifications to our app
// In a real production app, this would be a separate server sending push notifications

/**
 * Send a notification to a specific user
 * @param userId User ID to send notification to
 * @param notification Notification object to send
 */
export const sendNotificationToUser = async (
  userId: string, 
  notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>
): Promise<Notification | null> => {
  try {
    // In a real app, this would be sending a push notification
    // Here we're just inserting directly into the database
    const newNotification = {
      user_id: userId,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      read: false,
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([newNotification])
      .select()
      .single();
      
    if (error) {
      console.error('Error sending notification:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in sendNotificationToUser:', error);
    return null;
  }
};

/**
 * Send a test notification to the current user
 * This is for demo purposes
 */
export const sendTestNotification = async (): Promise<Notification | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error('User not authenticated');
    }
    
    const testNotification = {
      title: 'Test Notification',
      body: 'This is a test notification from the mock server! It appeared at the top of your screen.',
      type: 'info' as const,
    };
    
    return sendNotificationToUser(user.user.id, testNotification);
  } catch (error) {
    console.error('Error sending test notification:', error);
    return null;
  }
};

/**
 * Test function to trigger a notification for the current user
 * This is for testing purposes only
 */
export const testSendNotification = async (): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error('User not authenticated');
    }
    
    const testNotification = {
      title: 'Test Notification',
      body: 'This is a test notification to verify toast functionality.',
      type: 'info' as const,
    };
    
    await sendNotificationToUser(user.user.id, testNotification);
    console.log('Test notification sent successfully');
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};

/**
 * Listen for new notifications
 * @param callback Function to call when a new notification is received
 * @returns Function to unsubscribe
 */
export const listenForNotifications = (
  callback: (notification: Notification) => void
): (() => void) => {
  // Get the current user
  const getCurrentUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id;
  };
  
  // Create channel with current user's ID
  getCurrentUserId().then(userId => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }
    
    const subscription = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Call the callback with the new notification
          callback(payload.new as Notification);
        }
      )
      .subscribe();
      
    // Store subscription for cleanup
    subscriptionRef = subscription;
  });
  
  // Variable to store subscription for cleanup
  let subscriptionRef: any = null;
    
  // Return unsubscribe function
  return () => {
    if (subscriptionRef) {
      subscriptionRef.unsubscribe();
    }
  };
}; 