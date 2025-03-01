import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markAsRead, markAllAsRead, Notification, createSampleNotifications, showNotification } from '@/lib/notifications';
import { BlurView } from 'expo-blur';
import { sendTestNotification } from '@/lib/mockNotificationServer';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setRefreshing(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        body: 'Failed to load notifications'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Update local state to reflect all notifications as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showNotification({
        type: 'success',
        title: 'Success',
        body: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        body: 'Failed to mark all as read'
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      // Update local state to reflect this notification as read
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        body: 'Failed to mark notification as read'
      });
    }
  };

  const handleCreateSample = async () => {
    try {
      await createSampleNotifications();
      await loadNotifications();
      showNotification({
        type: 'success',
        title: 'Success',
        body: 'Sample notifications created'
      });
    } catch (error) {
      console.error('Error creating sample notifications:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        body: 'Failed to create sample notifications'
      });
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setSending(true);
      const notification = await sendTestNotification();
      if (notification) {
        await loadNotifications();
        showNotification({
          type: 'success',
          title: 'Success',
          body: 'Test notification sent'
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        body: 'Failed to send test notification'
      });
    } finally {
      setSending(false);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const getIconName = () => {
      switch (item.type) {
        case 'info': return 'information-circle';
        case 'success': return 'checkmark-circle';
        case 'warning': return 'warning';
        case 'error': return 'alert-circle';
        default: return 'notifications';
      }
    };

    const getIconColor = () => {
      switch (item.type) {
        case 'info': return '#3498db';
        case 'success': return '#2ecc71';
        case 'warning': return '#f39c12';
        case 'error': return '#e74c3c';
        default: return '#95a5a6';
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.read && styles.unreadNotification]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getIconName()} size={24} color={getIconColor()} />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          title: 'Powiadomienia',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={handleMarkAllAsRead}
                style={styles.headerButton}
                disabled={!notifications.some(n => !n.read)}
              >
                <Text style={[
                  styles.headerButtonText,
                  !notifications.some(n => !n.read) && styles.disabledText
                ]}>
                  Oznacz wszystkie jako przeczytane
                </Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {/* Translucent header overlay for iOS */}
      {Platform.OS === 'ios' && (
        <BlurView
          tint="dark"
          intensity={80}
          style={styles.headerOverlay}
        />
      )}
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleSendTestNotification}
          disabled={sending}
        >
          <Ionicons name="paper-plane" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>
            {sending ? 'Wysyłanie...' : 'Wyślij testowe powiadomienie'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#555" />
            <Text style={styles.emptyText}>Brak powiadomień</Text>
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={handleCreateSample}
            >
              <Text style={styles.sampleButtonText}>Utwórz przykładowe powiadomienia</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadNotifications}
            tintColor="#ff3b7f"
            colors={['#ff3b7f']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
  },
  notificationItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  unreadNotification: {
    backgroundColor: '#252525',
    borderLeftWidth: 3,
    borderLeftColor: '#ff3b7f',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationBody: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  notificationTime: {
    color: '#888',
    fontSize: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b7f',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#555',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 16,
  },
  headerButtonText: {
    color: '#ff3b7f',
    fontSize: 14,
  },
  disabledText: {
    color: '#555',
  },
  backButton: {
    marginLeft: 16,
  },
  sampleButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sampleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20, // Height of the status bar area
    zIndex: 1,
  },
  actionButtonsContainer: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#ff3b7f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 