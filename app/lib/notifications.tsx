import React from 'react';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read?: boolean;
  created_at: string;
  recipient_id?: string; // Optional: if not set, it's a broadcast notification
}

// Mock notifications data
let notifications: Notification[] = [];

export const getNotifications = async (): Promise<Notification[]> => {
  // Check if the user is authenticated
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    // User is not authenticated, throw a specific error that can be handled
    throw new Error('User not authenticated');
  }
  
  return notifications;
};

export const markAsRead = async (id: string): Promise<void> => {
  notifications = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
};

export const markAllAsRead = async (): Promise<void> => {
  notifications = notifications.map(n => ({ ...n, read: true }));
};

export const createSampleNotifications = async (): Promise<void> => {
  notifications = [
    {
      id: '1',
      type: 'info',
      title: 'Welcome!',
      body: 'Welcome to the app! This is a sample notification.',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'success',
      title: 'Points Earned',
      body: 'You earned 100 points for your recent visit!',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      type: 'warning',
      title: 'Reward Expiring',
      body: 'Your reward is expiring soon. Use it before it expires!',
      read: false,
      created_at: new Date().toISOString()
    }
  ];
};

export type NotificationInput = Omit<Notification, 'id' | 'created_at' | 'read'>;

// Admin functions
export const sendNotification = async (input: NotificationInput): Promise<void> => {
  const newNotification: Notification = {
    ...input,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    read: false,
  };

  notifications.push(newNotification);
  
  // Show a toast to the recipient(s)
  const toastType = input.type === 'warning' ? 'info' : input.type;
  
  Toast.show({
    type: toastType,
    text1: input.title,
    text2: input.body,
    position: 'top',
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 50,
    onPress: () => {
      if (input.link && input.link.startsWith('/')) {
        router.push(input.link as any);
      } else {
        router.push('/notifications');
      }
    }
  });
};

// Custom toast configurations
export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#2ecc71',
        backgroundColor: '#1e1e1e',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 13,
        color: '#ddd'
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#e74c3c',
        backgroundColor: '#1e1e1e',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 13,
        color: '#ddd'
      }}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#3498db',
        backgroundColor: '#1e1e1e',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#fff'
      }}
      text2Style={{
        fontSize: 13,
        color: '#ddd'
      }}
    />
  ),
}; 