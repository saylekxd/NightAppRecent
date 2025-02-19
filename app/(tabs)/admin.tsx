import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAdminStats } from '@/lib/admin';

interface AdminStats {
  visits_count: number;
  rewards_used: number;
  points_awarded: number;
  capacity_percentage: number;
}

export default function AdminScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
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

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadStats}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          <Link href="/(admin)/scan" asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="scan" size={32} color="#ff3b7f" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Scan QR Code</Text>
                <Text style={styles.cardDescription}>
                  Scan and validate entry passes
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>
          </Link>

          <Link href="/(admin)/redeem" asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="gift" size={32} color="#ff3b7f" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Redeem Rewards</Text>
                <Text style={styles.cardDescription}>
                  Process reward redemption codes
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>
          </Link>

          <Link href="/(admin)/events" asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="calendar" size={32} color="#ff3b7f" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Manage Events</Text>
                <Text style={styles.cardDescription}>
                  Create and manage upcoming events
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>
          </Link>

          <View style={styles.statsContainer}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Today's Stats</Text>
              <Pressable onPress={loadStats}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.visits_count || 0}</Text>
                <Text style={styles.statLabel}>Visits</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.rewards_used || 0}</Text>
                <Text style={styles.statLabel}>Rewards Used</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.points_awarded || 0}</Text>
                <Text style={styles.statLabel}>Points Awarded</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.capacity_percentage || 0}%</Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
            </View>
          </View>
        </View>
      )}
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
    padding: 20,
    paddingTop: 40,
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
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
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
});