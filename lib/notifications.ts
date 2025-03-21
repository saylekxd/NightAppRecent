import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  link?: string;
}

/**
 * Fetches all notifications for the current user
 * @returns Array of notifications
 */
export const getNotifications = async (): Promise<Notification[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user || !user.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

/**
 * Marks a notification as read
 * @param id Notification ID
 */
export const markAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};

/**
 * Marks all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user || !user.user) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.user.id)
    .eq('read', false);
    
  if (error) {
    throw error;
  }
};

/**
 * Deletes a notification
 * @param id Notification ID
 */
export const deleteNotification = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};

/**
 * Updates notification preferences for the current user
 * @param preferences Notification preferences object
 */
export const updateNotificationPreferences = async (preferences: Record<string, boolean>): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user || !user.user) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences: preferences })
    .eq('id', user.user.id);
    
  if (error) {
    throw error;
  }
};

/**
 * Gets notification preferences for the current user
 */
export const getNotificationPreferences = async (): Promise<Record<string, boolean>> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user || !user.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', user.user.id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data?.notification_preferences || {
    newEvents: true,
    pointsEarned: true,
    rewardAvailable: true,
    specialOffers: false,
    newsletter: false,
  };
};

/**
 * Creates sample notifications for testing purposes
 * This is temporary and should be removed in production
 */
export const createSampleNotifications = async (): Promise<void> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user || !user.user) {
    throw new Error('User not authenticated');
  }
  
  const sampleNotifications = [
    {
      user_id: user.user.id,
      title: 'Witaj w aplikacji!',
      body: 'Dziękujemy za dołączenie do naszej społeczności.',
      type: 'info',
      read: false,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ];
  
  // Check if we already have notifications to avoid duplicates
  const { data: existingNotifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', user.user.id);
    
  if (existingNotifications && existingNotifications.length > 0) {
    console.log('Sample notifications already exist');
    return;
  }
  
  for (const notification of sampleNotifications) {
    const { error } = await supabase
      .from('notifications')
      .insert([notification]);
      
    if (error) {
      console.error('Error creating sample notification:', error);
    }
  }
}; 