import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getProfile, signOut } from '@/lib/auth';
import { getProfileStats, ProfileStats } from '@/lib/profile';
import { router } from 'expo-router';
import { getUserRank, getPointsToNextRank, Rank } from '@/lib/ranks';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [pointsToNext, setPointsToNext] = useState<number>(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        getProfile(),
        getProfileStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);

      // Calculate rank and next rank progress
      const rank = getUserRank(profileData.points);
      const pointsToNextRank = getPointsToNextRank(profileData.points);
      setCurrentRank(rank);
      setPointsToNext(pointsToNextRank);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
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
        <Pressable
          onPress={() => router.push('/account/avatar')}
          style={styles.avatarContainer}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800' }}
            style={styles.profileImage}
          />
          <View style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </Pressable>
        <Text style={styles.name}>{profile?.full_name || profile?.username}</Text>
        <View style={styles.membershipInfo}>
          <Ionicons 
            name={currentRank?.icon || "star-outline"} 
            size={20} 
            color={currentRank?.color || "#CD7F32"} 
          />
          <Text style={[styles.membershipText, { color: currentRank?.color || "#CD7F32" }]}>
            {currentRank?.name || 'Bronze'} Member
          </Text>
        </View>
        {pointsToNext > 0 && (
          <Text style={styles.nextRankText}>
            {pointsToNext} points until next rank
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.points || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.visits_count || 0}</Text>
          <Text style={styles.statLabel}>Visits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.active_rewards_count || 0}</Text>
          <Text style={styles.statLabel}>Active Rewards</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/edit-profile')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="person-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/notifications')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/privacy')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Privacy & Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('https://support.example.com')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={handleSignOut}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="log-out-outline" size={24} color="#ff3b7f" />
            <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
          </View>
        </Pressable>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#ff3b7f',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  membershipText: {
    marginLeft: 5,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    color: '#fff',
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    height: '100%',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    marginLeft: 15,
    fontSize: 16,
  },
  signOutText: {
    color: '#ff3b7f',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  nextRankText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});