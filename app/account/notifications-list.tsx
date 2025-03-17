import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, Notification } from '@/lib/notifications';
import { Stack, router } from 'expo-router';

export default function NotificationsListScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      if (err instanceof Error && err.message === 'User not authenticated') {
        setNotifications([]);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadNotifications();
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Update local state to mark all as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };
  
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const typeIcons: Record<string, any> = {
      info: 'information-circle',
      success: 'checkmark-circle',
      warning: 'warning',
      error: 'alert-circle',
    };
    
    const typeColors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    };
    
    return (
      <Pressable
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification
        ]}
        onPress={() => handleMarkAsRead(item.id)}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: typeColors[item.type] }]}>
            <Ionicons name={typeIcons[item.type] as any} size={20} color="#fff" />
          </View>
          <View style={styles.notificationTextContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.body}</Text>
            <Text style={styles.notificationTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#999" />
        </Pressable>
      </Pressable>
    );
  };
  
  const EmptyNotifications = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#666" />
      <Text style={styles.emptyText}>Brak powiadomień</Text>
      <Text style={styles.emptySubtext}>
        Kiedy otrzymasz powiadomienia, pojawią się tutaj
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <Stack.Screen 
        options={{
          title: 'Powiadomienia',
          headerRight: () => (
            <Pressable onPress={() => router.push('/account/notifications')}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </Pressable>
          ),
        }} 
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => loadNotifications()}>
            <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
          </Pressable>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff3b7f" />
          <Text style={styles.loadingText}>Laduje powiadomienia...</Text>
        </View>
      ) : (
        <>
          <View style={styles.actionButtonsContainer}>
            {notifications.length > 0 && (
              <Pressable 
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.markAllText}>Oznacz jako przeczytane</Text>
              </Pressable>
            )}
          </View>
          
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderNotificationItem}
            ListEmptyComponent={<EmptyNotifications />}
            contentContainerStyle={notifications.length === 0 ? styles.emptyListContainer : styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#ff3b7f"
                colors={["#ff3b7f"]}
              />
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContainer: {
    padding: 15,
  },
  emptyListContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  notificationItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 0,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#ff3b7f',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    color: '#888',
    fontSize: 12,
  },
  deleteButton: {
    padding: 10,
  },
  markAllButton: {
    backgroundColor: 'rgba(255, 59, 127, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  markAllText: {
    color: '#ff3b7f',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  }
}); 