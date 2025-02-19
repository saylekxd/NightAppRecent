import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Event, getAllEvents, createEvent, updateEvent, deleteEvent } from '@/lib/events';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

interface CommunityPost {
  id: string;
  content: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
}

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingPosts, setPendingPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: new Date().toISOString(),
    image_url: '',
    is_active: true,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [eventsData, postsData] = await Promise.all([
        getAllEvents(),
        loadPendingPosts()
      ]);
      setEvents(eventsData);
      setPendingPosts(postsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const handlePostAction = async (postId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ status: action })
        .eq('id', postId);

      if (error) throw error;
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process post');
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingEvent) {
        await updateEvent(editingEvent, formData);
      } else {
        await createEvent(formData);
      }
      await loadData();
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString(),
        image_url: '',
        is_active: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      image_url: event.image_url,
      is_active: event.is_active,
    });
    setEditingEvent(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteEvent(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {pendingPosts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Posts</Text>
          {pendingPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={{
                    uri: post.user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800'
                  }}
                  style={styles.avatar}
                />
                <View style={styles.postHeaderText}>
                  <Text style={styles.userName}>{post.user?.full_name}</Text>
                  <Text style={styles.postTime}>
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postActions}>
                <Pressable
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handlePostAction(post.id, 'approved')}>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handlePostAction(post.id, 'rejected')}>
                  <Ionicons name="close" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Official Events</Text>
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
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <View style={styles.eventActions}>
                <Pressable
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(event)}>
                  <Ionicons name="pencil" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(event.id)}>
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    color: '#666',
    fontSize: 14,
  },
  postContent: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 5,
  },
  eventCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  eventDate: {
    color: '#ff3b7f',
    marginBottom: 10,
  },
  eventDescription: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 15,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});