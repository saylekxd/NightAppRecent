import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, TouchableOpacity, Modal, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { getProfile, signOut } from '@/lib/auth';
import { getProfileStats, ProfileStats } from '@/lib/profile';
import { router } from 'expo-router';
import { getUserRank, getPointsToNextRank, Rank } from '@/lib/ranks';
import { getTransactionHistory, Transaction } from '@/lib/points';
import { ProfileSkeleton } from '@/app/_components/ui/SkeletonLoader';
import { NotificationBadge } from '@/app/_components/ui/NotificationBadge';
import { createSampleNotifications } from '@/lib/notifications';
import { GalleryImagePicker } from '@/app/_components/ui/GalleryImagePicker';
import * as Sentry from '@sentry/react-native';

// Define a type for the profile data
interface ProfileData {
  full_name?: string;
  username?: string;
  avatar_url?: string;
  [key: string]: any; // For other properties
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [pointsToNext, setPointsToNext] = useState<number>(0);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  useEffect(() => {
    loadProfile();
    
    // Create sample notifications for testing
    // This should be removed in production
    createSampleNotifications()
      .catch(console.error);
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      setLoading(true);
      const [profileData, statsData, transactionsData] = await Promise.all([
        getProfile(),
        getProfileStats(),
        getTransactionHistory(),
      ]);

      // Calculate total earned points from transactions
      const wholePoints = transactionsData
        .filter((transaction: Transaction) => transaction.type === 'earn')
        .reduce((sum: number, transaction: Transaction) => sum + transaction.amount, 0);

      setProfile(profileData);
      setStats(statsData);

      // Calculate rank and next rank progress based on whole points
      const rank = getUserRank(wholePoints);
      const pointsToNextRank = getPointsToNextRank(wholePoints);
      setCurrentRank(rank);
      setPointsToNext(pointsToNextRank);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  };

  const handleImageSelected = async (imageUrl: string) => {
    try {
      console.log('Image selected, updating profile...', imageUrl);
      
      // Close the modal first to prevent UI issues
      setShowGalleryPicker(false);
      
      // Small delay to ensure the modal is closed before updating UI
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set loading state
      setLoading(true);
      
      // Wait a bit longer to ensure the UI has time to update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        // Reload profile to reflect changes
        await loadProfile();
        console.log('Profile refreshed with new image');
      } catch (loadError) {
        console.error('Error loading profile:', loadError);
        
        // Fall back to manual state update if profile loading fails
        setProfile((prev: ProfileData | null) => ({
          ...prev,
          avatar_url: imageUrl
        }));
        console.log('Applied fallback image update to state');
      }
    } catch (err) {
      console.error('Error handling image selection:', err);
      setError('Failed to update profile image. Please try again.');
    } finally {
      // Always make sure loading state is reset
      setLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.headerControls}>
        <View style={{ flex: 1 }} />
      </View>
      
      <View style={styles.header}>
        <Pressable
          onPress={() => setShowGalleryPicker(true)}
          style={styles.avatarContainer}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://rwxzctowvxylopuzpsti.supabase.co/storage/v1/object/sign/images/avatar-example.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvYXZhdGFyLWV4YW1wbGUucG5nIiwiaWF0IjoxNzQyMjM1NTY1LCJleHAiOjE5MzE0NTE1NjV9.Ta66j-srB78MR1nhqWFRFTeyVz-ZO6kMdJYYxJcqWuw' }}
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
            {currentRank?.name || 'Nowicjusz'}
          </Text>
        </View>
        {pointsToNext > 0 && (
          <Text style={styles.nextRankText}>
            {pointsToNext} punktów do następnej rangi
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.points || 0}</Text>
          <Text style={styles.statLabel}>Punkty</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.visits_count || 0}</Text>
          <Text style={styles.statLabel}>Zeskanowane QR</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.active_rewards_count || 0}</Text>
          <Text style={styles.statLabel}>Aktywne nagrody</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Spróbuj Ponownie</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ustawienia konta</Text>
        
        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/edit-profile')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="person-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Edytuj profil</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/notifications-list')}>
          <View style={styles.menuItemLeft}>
            <View style={{ position: 'relative' }}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <NotificationBadge />
            </View>
            <Text style={styles.menuItemText}>Powiadomienia</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pomoc i informacje</Text>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/help')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Pomoc i wsparcie</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/about')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="information-circle-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>O aplikacji</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push('/account/feedback')}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="chatbox-outline" size={24} color="#fff" />
            <Text style={styles.menuItemText}>Prześlij opinię</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>
      </View>

      {/* Sign out button */}
      <View>
        <Pressable 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Wyloguj się</Text>
        </Pressable>
      </View>

      {/* Gallery Picker Modal */}
      <Modal
        transparent={true}
        visible={showGalleryPicker}
        animationType="slide"
        onRequestClose={() => setShowGalleryPicker(false)}>
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => setShowGalleryPicker(false)} 
          />
          <View style={styles.modalContainer}>
            <GalleryImagePicker
              currentAvatarUrl={profile?.avatar_url || null}
              onImageSelected={handleImageSelected}
              onClose={() => setShowGalleryPicker(false)}
            />
          </View>
        </View>
      </Modal>
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
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
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
    bottom: 0,
    right: 0,
    backgroundColor: '#ff3b7f',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  nextRankText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#fff',
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 15,
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
  signOutButton: {
    backgroundColor: '#ff3b7f',
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b7f',
    textAlign: 'center',
    marginBottom: 15,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  contentContainer: {
    paddingBottom: 90,
  }
});