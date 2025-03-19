import { View, Text, StyleSheet, ScrollView, Image, Pressable, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rank } from '@/lib/ranks';
import { useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

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

interface CommunityPostsProps {
  posts: CommunityPost[];
  newPost: string;
  posting: boolean;
  onNewPostChange: (text: string) => void;
  onSubmitPost: () => void;
  onLike: (postId: string, hasLiked: boolean) => void;
}

export function CommunityPosts({ 
  posts, 
  newPost, 
  posting, 
  onNewPostChange, 
  onSubmitPost, 
  onLike 
}: CommunityPostsProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const likeAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    // Initialize like animations for each post
    posts.forEach(post => {
      if (!likeAnimations[post.id]) {
        likeAnimations[post.id] = new Animated.Value(1);
      }
    });

    Animated.timing(inputAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [posts]);

  const handleLikeWithAnimation = (postId: string, hasLiked: boolean) => {
    // Animate the heart icon
    Animated.sequence([
      Animated.timing(likeAnimations[postId], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimations[postId], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    onLike(postId, hasLiked);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Spotted</Text>
      </View>
      
      <Animated.View 
        style={[
          styles.postInput,
          {
            opacity: inputAnim,
            transform: [
              { 
                translateY: inputAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }
            ]
          }
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Podziel się czymś ze społecznością..."
          placeholderTextColor="#666"
          value={newPost}
          onChangeText={onNewPostChange}
          maxLength={100}
          multiline
          numberOfLines={3}
        />
        <View style={styles.inputFooter}>
          <Text style={styles.disclaimer}>
            Uwaga: Posty będą przeglądane przed pojawieniem się w kanale społeczności.
          </Text>
          <Text style={[
            styles.characterCount,
            newPost.length > 80 && { color: '#ff3b7f' }
          ]}>
            {newPost.length}/100
          </Text>
        </View>
        <Pressable
          style={[styles.postButton, (!newPost.trim() || posting) && styles.postButtonDisabled]}
          onPress={onSubmitPost}
          disabled={!newPost.trim() || posting}>
          <Text style={styles.postButtonText}>
            {posting ? 'Wysyłanie...' : 'Wyślij do weryfikacji'}
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.postsScroll}
        contentContainerStyle={styles.postsScrollContainer}
        snapToInterval={295}
        decelerationRate={0.85}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      >
        {posts.map((post, index) => {
          const inputRange = [
            (index - 1) * 295,
            index * 295,
            (index + 1) * 295
          ];
          
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.95, 1, 0.95],
            extrapolate: 'clamp'
          });
          
          return (
            <Animated.View 
              key={post.id} 
              style={[
                styles.postCard,
                { transform: [{ scale }] }
              ]}
            >
              <LinearGradient
                colors={['rgba(30, 30, 30, 0.6)', 'rgba(20, 20, 20, 0.8)']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.postHeader}>
                <Image
                  source={{
                    uri: post.user?.avatar_url || 'https://rwxzctowvxylopuzpsti.supabase.co/storage/v1/object/sign/images/avatar-example.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvYXZhdGFyLWV4YW1wbGUucG5nIiwiaWF0IjoxNzQyMjM1NTY1LCJleHAiOjE5MzE0NTE1NjV9.Ta66j-srB78MR1nhqWFRFTeyVz-ZO6kMdJYYxJcqWuw'
                  }}
                  style={styles.avatar}
                />
                <View style={styles.postHeaderText}>
                  <View style={styles.userNameContainer}>
                    <Text style={styles.userName}>{post.user?.full_name}</Text>
                    <Ionicons 
                      name={post.user?.rank?.icon || "star-outline"} 
                      size={16} 
                      color={post.user?.rank?.color || "#CD7F32"} 
                    />
                  </View>
                  <Text style={styles.postTime}>
                    {new Date(post.created_at).toLocaleDateString('pl-PL', {
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
                  onPress={() => handleLikeWithAnimation(post.id, post.has_liked)}>
                  <Animated.View style={{ 
                    transform: [{ scale: likeAnimations[post.id] || 1 }]
                  }}>
                    <Ionicons
                      name={post.has_liked ? 'heart' : 'heart-outline'}
                      size={24}
                      color={post.has_liked ? '#ff3b7f' : '#fff'}
                    />
                  </Animated.View>
                  <Text style={[
                    styles.likeCount,
                    post.has_liked && styles.likedCount
                  ]}>
                    {post.likes_count}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    display: 'none',
  },
  postInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  postsScroll: {
    marginRight: -20,
    marginLeft: -20,
    paddingLeft: 20,
  },
  postsScrollContainer: {
    paddingRight: 30,
    paddingVertical: 15,
  },
  postCard: {
    width: 280,
    marginRight: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.7)',
  },
  postHeaderText: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(51, 51, 51, 0.7)',
    paddingTop: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  likedCount: {
    color: '#ff3b7f',
  },
});

export default CommunityPosts; 