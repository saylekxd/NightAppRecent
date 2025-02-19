import { View, Text, StyleSheet, Image, ScrollView, Pressable, RefreshControl, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { getProfile } from '@/lib/auth';
import { getUpcomingEvents, Event } from '@/lib/events';
import { getTransactionHistory, Transaction } from '@/lib/points';
import { supabase } from '@/lib/supabase';
import { getUserRank, getPointsToNextRank, Rank } from '@/lib/ranks';

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
  likes_count: number;
  has_liked: boolean;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<Transaction[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [pointsToNext, setPointsToNext] = useState<number>(0);

  const loadData = async () => {
    try {
      setError(null);
      const [profileData, eventsData, activitiesData, postsData] = await Promise.all([
        getProfile(),
        getUpcomingEvents(),
        getTransactionHistory(),
        loadPosts(),
      ]);
      setProfile(profileData);
      setEvents(eventsData);
      setActivities(activitiesData);
      setPosts(postsData || []);
      
      // Calculate rank and next rank progress
      const rank = getUserRank(profileData.points);
      const pointsToNextRank = getPointsToNextRank(profileData.points);
      setCurrentRank(rank);
      setPointsToNext(pointsToNextRank);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        user:profiles(full_name, avatar_url),
        likes:community_post_likes(user_id)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data.map(post => ({
      ...post,
      user: post.user || { full_name: 'Unknown User', avatar_url: null },
      likes_count: post.likes?.length || 0,
      has_liked: post.likes?.some((like: any) => like.user_id === user.id) || false,
    }));
  };

  const handlePost = async () => {
    if (!newPost.trim() || !profile) return;

    try {
      setPosting(true);
      const { error } = await supabase
        .from('community_posts')
        .insert({
          content: newPost.trim(),
          user_id: profile.id,
          status: 'pending' // Posts start as pending
        });

      if (error) throw error;

      setNewPost('');
      // Show feedback that post is pending approval
      alert('Your post has been submitted for approval');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string, hasLiked: boolean) => {
    if (!profile) return;

    try {
      if (hasLiked) {
        await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', profile.id);
      } else {
        await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: profile.id,
          });
      }
      loadData();
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
          titleColor="#fff"
        />
      }
    >
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800' }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{profile?.full_name || profile?.username}</Text>
        </View>
      </View>

      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <View>
            <Text style={styles.pointsLabel}>Current Points</Text>
            <Text style={styles.pointsValue}>{profile?.points || 0}</Text>
          </View>
          <Pressable 
            style={styles.refreshButton}
            onPress={loadData}
          >
            <Ionicons name="refresh" size={24} color="#ff3b7f" />
          </Pressable>
        </View>
        <View style={styles.tierInfo}>
          <Ionicons 
            name={currentRank?.icon || "star"} 
            size={20} 
            color={currentRank?.color || "#ff3b7f"} 
          />
          <Text style={[styles.tierText, { color: currentRank?.color || "#ff3b7f" }]}>
            {currentRank?.name || 'Bronze'} Member
          </Text>
        </View>
        {pointsToNext > 0 && (
          <Text style={styles.nextRankText}>
            {pointsToNext} points until next rank
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Spotlight</Text>
        <View style={styles.postInput}>
          <TextInput
            style={styles.input}
            placeholder="Share something with the community..."
            placeholderTextColor="#666"
            value={newPost}
            onChangeText={(text) => {
              if (text.length <= 100) {
                setNewPost(text);
              }
            }}
            maxLength={100}
            multiline
            numberOfLines={3}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.disclaimer}>
              Note: Posts will be reviewed before appearing in the community feed.
            </Text>
            <Text style={styles.characterCount}>
              {newPost.length}/100
            </Text>
          </View>
          <Pressable
            style={[styles.postButton, (!newPost.trim() || posting) && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!newPost.trim() || posting}>
            <Text style={styles.postButtonText}>
              {posting ? 'Submitting...' : 'Submit for Review'}
            </Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
          {posts.map((post) => (
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
                  style={styles.likeButton}
                  onPress={() => handleLike(post.id, post.has_liked)}>
                  <Ionicons
                    name={post.has_liked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={post.has_liked ? '#ff3b7f' : '#fff'}
                  />
                  <Text style={[
                    styles.likeCount,
                    post.has_liked && styles.likedCount
                  ]}>
                    {post.likes_count}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
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
                  })}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  pointsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointsLabel: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 16,
  },
  pointsValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 20,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  tierText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  nextRankText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventsScroll: {
    marginHorizontal: -20,
  },
  eventCard: {
    width: 280,
    marginHorizontal: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  postInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  disclaimer: {
    color: '#666',
    fontSize: 12,
  },
  characterCount: {
    color: '#666',
    fontSize: 12,
  },
  postButton: {
    backgroundColor: '#ff3b7f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  postCard: {
    width: 280,
    marginHorizontal: 10,
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
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  likedCount: {
    color: '#ff3b7f',
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