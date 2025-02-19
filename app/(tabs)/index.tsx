import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useCallback } from 'react';
import { getProfile } from '@/lib/auth';
import { getUpcomingEvents, Event } from '@/lib/events';
import { getTransactionHistory, Transaction } from '@/lib/points';
import { supabase } from '@/lib/supabase';
import { getUserRank, getPointsToNextRank, Rank, ranks } from '@/lib/ranks';
import { Header, PointsCard, CommunityPosts, Events, Activities } from './home/components';

interface CommunityPost {
  id: string;
  content: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    full_name: string;
    avatar_url: string | null;
    rank: Rank;
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

      const earnedPoints = activitiesData
        .filter(activity => activity.type === 'earn')
        .reduce((sum, activity) => sum + activity.amount, 0);

      setProfile({ ...profileData, earnedPoints });
      setEvents(eventsData);
      setActivities(activitiesData);
      setPosts(postsData || []);
      
      const rank = getUserRank(earnedPoints);
      const pointsToNextRank = getPointsToNextRank(earnedPoints);
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

    // First get the posts
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url),
        likes:community_post_likes(user_id)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) throw postsError;

    // Get transactions for all users who made posts
    const userIds = postsData
      .filter(post => post.user)
      .map(post => post.user.id);

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .in('user_id', userIds)
      .eq('type', 'earn');

    if (transactionsError) throw transactionsError;

    // Calculate total points for each user
    const userPoints = transactionsData.reduce((acc: { [key: string]: number }, transaction) => {
      acc[transaction.user_id] = (acc[transaction.user_id] || 0) + transaction.amount;
      return acc;
    }, {});

    return postsData.map(post => ({
      ...post,
      user: post.user ? {
        ...post.user,
        rank: getUserRank(userPoints[post.user.id] || 0)
      } : { 
        full_name: 'Anonymous', 
        avatar_url: null,
        rank: ranks[0] // Bronze rank for anonymous users
      },
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
          status: 'pending'
        });

      if (error) throw error;

      setNewPost('');
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
      
      <Header 
        fullName={profile?.full_name} 
        username={profile?.username} 
      />

      <PointsCard 
        points={profile?.earnedPoints || 0}
        currentRank={currentRank}
        pointsToNext={pointsToNext}
        onRefresh={loadData}
      />

      <CommunityPosts 
        posts={posts}
        newPost={newPost}
        posting={posting}
        onNewPostChange={setNewPost}
        onSubmitPost={handlePost}
        onLike={handleLike}
      />

      <Events events={events} />

      <Activities activities={activities} />
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
});