import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { getAdminStats, checkAdminStatus } from '@/lib/admin';
import { DashboardSkeleton, CardSkeleton } from '@/app/components/SkeletonLoader';
import { Review } from '@/components/Review';
import { getReviewStats } from '@/lib/reviews';
import { PromotionPhotos } from '@/app/components/PromotionPhotos';

interface AdminStats {
  visits_count: number;
  rewards_used: number;
  points_awarded: number;
  capacity_percentage: number;
}

interface ReviewStats {
  totalReviews: number;
  averageMood: number;
  moodDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  // Add rotation animation for refresh icon
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Function to start refresh animation
  const startRefreshAnimation = () => {
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  };
  
  useEffect(() => {
    const initializeData = async () => {
      await checkUserAdmin();
      loadData();
    };
    
    initializeData();
  }, []);

  const checkUserAdmin = async () => {
    try {
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      setRefreshing(true);
      startRefreshAnimation();
      
      // For non-admin users, only try to get admin stats if they are admin
      if (isAdmin) {
        const [adminStatsData, reviewStatsData] = await Promise.all([
          getAdminStats().catch(err => {
            console.error('Error loading admin stats:', err);
            return null;
          }),
          getReviewStats().catch(err => {
            console.error('Error loading review stats:', err);
            return null;
          })
        ]);
        
        setStats(adminStatsData);
        setReviewStats(reviewStatsData);
      } else {
        // For non-admin users, don't try to fetch admin-only data
        setStats(null);
        setReviewStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się załadować statystyk');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Helper function to render mood icons
  const renderMoodIcon = (mood: number) => {
    const icons = {
      1: 'sad-outline',
      2: 'sad',
      3: 'happy-outline',
      4: 'happy',
      5: 'heart'
    };
    return icons[mood as keyof typeof icons] || 'help-circle-outline';
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <LinearGradient
          colors={['#1a1a1a', '#000']}
          style={styles.background}
        />
        
        <View style={styles.header}>
          <Text style={styles.title}>Panel</Text>
          <Pressable 
            style={styles.refreshButton}
            onPress={() => {
              loadData();
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#ff3b7f" />
            ) : (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="refresh" size={24} color="#ff3b7f" />
              </Animated.View>
            )}
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* User Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>Podziel się swoją opinią</Text>
            
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#ff3b7f" />
              <Text style={styles.infoText}>
              Użytkownicy mogą przesłać opinię tylko wtedy, gdy zeskanowali kod QR w ciągu ostatnich 24 godzin i nie zamieścili jeszcze recenzji w tym okresie.
              </Text>
            </View>
            
            <Review onReviewSubmitted={loadData} />
            
            {/* Review Statistics - only visible to admins */}
            {isAdmin && reviewStats && (
              <View style={styles.reviewStatsContainer}>
                <Text style={styles.reviewStatsTitle}>Feedback statystyki</Text>
                
                <View style={styles.reviewStatsSummary}>
                  <View style={styles.reviewStatItem}>
                    <Text style={styles.reviewStatValue}>{reviewStats.totalReviews}</Text>
                    <Text style={styles.reviewStatLabel}>Wyszystkie opinie</Text>
                  </View>
                  <View style={styles.reviewStatItem}>
                    <Text style={styles.reviewStatValue}>{reviewStats.averageMood.toFixed(1)}</Text>
                    <Text style={styles.reviewStatLabel}>Średnia ocena</Text>
                  </View>
                </View>
                
                <Text style={styles.distributionTitle}>Rozkład nastrojów</Text>
                <View style={styles.moodDistribution}>
                  {Object.entries(reviewStats.moodDistribution).map(([mood, count]) => (
                    <View key={mood} style={styles.moodItem}>
                      <Ionicons 
                        name={renderMoodIcon(parseInt(mood)) as any} 
                        size={24} 
                        color="#ff3b7f" 
                      />
                      <Text style={styles.moodCount}>{count}</Text>
                      <View 
                        style={[
                          styles.moodBar, 
                          { 
                            width: `${(count / reviewStats.totalReviews) * 100}%`,
                            backgroundColor: mood === '5' ? '#ff3b7f' : 
                                            mood === '4' ? '#ff6b9f' : 
                                            mood === '3' ? '#ff9bbf' : 
                                            mood === '2' ? '#ffcbdf' : '#ffebf0'
                          }
                        ]} 
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* User accessible features */}
          <Pressable style={styles.card} onPress={() => router.push('/menu')}>
            <View style={styles.cardIcon}>
              <Ionicons name="wine" size={32} color="#ff3b7f" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Menu drinków i shotów</Text>
              <Text style={styles.cardDescription}>
                Sprawdź dostępne drinki i shoty w naszym menu
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>

          {/* Admin section button - only visible to admins */}
          {isAdmin && (
            <Pressable 
              style={[styles.card, styles.adminCard]}
              onPress={() => {
                router.push({
                  pathname: "/(admin)/dashboard"
                });
              }}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="settings" size={32} color="#ff3b7f" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Panel Administratora</Text>
                <Text style={styles.cardDescription}>
                  Dostęp do funkcji administracyjnych
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>
          )}

          {/* Admin stats - only visible to admins */}
          {isAdmin && (
            <View style={styles.statsContainer}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Dzisiejsze statystyki</Text>
                <Pressable onPress={loadData}>
                  <Text style={styles.refreshText}>Odśwież</Text>
                </Pressable>
              </View>

              {loading ? (
                <CardSkeleton />
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats?.visits_count || 0}</Text>
                    <Text style={styles.statLabel}>Zeskanowane QR</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats?.rewards_used || 0}</Text>
                    <Text style={styles.statLabel}>Użyte nagrody</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats?.points_awarded || 0}</Text>
                    <Text style={styles.statLabel}>Przyznane punkty</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats?.capacity_percentage || 0}%</Text>
                    <Text style={styles.statLabel}>Pojemność</Text>
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Promotion Photos Section */}
          <PromotionPhotos />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  adminCard: {
    borderColor: '#ff3b7f',
    borderWidth: 2,
    marginTop: 30,
  },
  cardIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshText: {
    color: '#ff3b7f',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -5,
  },
  statCard: {
    width: '50%',
    padding: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b7f',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff3b7f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notAdminContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notAdminText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  notAdminSubtext: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  reviewStatsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  reviewStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  reviewStatsSummary: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  reviewStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  reviewStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b7f',
    marginBottom: 4,
  },
  reviewStatLabel: {
    fontSize: 14,
    color: '#999',
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  moodDistribution: {
    marginTop: 8,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodCount: {
    width: 30,
    color: '#fff',
    marginLeft: 8,
    marginRight: 8,
  },
  moodBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 127, 0.3)',
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 127, 0.3)',
  },
});