import { View, Text, StyleSheet, ScrollView, Image, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rank } from '@/lib/ranks';

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
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Community Spotlight</Text>
      <View style={styles.postInput}>
        <TextInput
          style={styles.input}
          placeholder="Share something with the community..."
          placeholderTextColor="#666"
          value={newPost}
          onChangeText={onNewPostChange}
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
          onPress={onSubmitPost}
          disabled={!newPost.trim() || posting}>
          <Text style={styles.postButtonText}>
            {posting ? 'Submitting...' : 'Submit for Review'}
          </Text>
        </Pressable>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.postsScroll}
        contentContainerStyle={styles.postsScrollContainer}
      >
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
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{post.user?.full_name}</Text>
                  <View style={styles.rankBadge}>
                    <Ionicons 
                      name={post.user?.rank?.icon || "star-outline"} 
                      size={14} 
                      color={post.user?.rank?.color || "#CD7F32"} 
                    />
                    <Text style={[styles.rankText, { color: post.user?.rank?.color || "#CD7F32" }]}>
                      {post.user?.rank?.name || 'Bronze'}
                    </Text>
                  </View>
                </View>
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
                onPress={() => onLike(post.id, post.has_liked)}>
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
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 20,
    
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
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
    paddingRight: 20,
  },
  postCard: {
    width: 280,
    marginRight: 15,
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
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 