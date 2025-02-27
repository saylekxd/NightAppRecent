import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAdminStats, checkAdminStatus } from '@/lib/admin';

interface AdminStats {
  visits_count: number;
  rewards_used: number;
  points_awarded: number;
  capacity_percentage: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const checkUserAdmin = async () => {
    try {
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
    } catch (err) {
      setIsAdmin(false);
    }
  };

  const loadStats = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się załadować statystyk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.content}>
        {/* User accessible features */}
        <Pressable style={styles.card} onPress={() => router.push('/')}>
          <View style={styles.cardIcon}>
            <Ionicons name="calendar" size={32} color="#ff3b7f" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nadchodzące Wydarzenia</Text>
            <Text style={styles.cardDescription}>
              Sprawdź nadchodzące wydarzenia i promocje
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        <Pressable style={styles.card} onPress={() => router.push('/(tabs)/rewards')}>
          <View style={styles.cardIcon}>
            <Ionicons name="star" size={32} color="#ff3b7f" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Specjalne Oferty</Text>
            <Text style={styles.cardDescription}>
              Odkryj specjalne oferty przygotowane dla Ciebie
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
              <Text style={styles.statsTitle}>Dzisiejsze Statystyki</Text>
              <Pressable onPress={loadStats}>
                <Text style={styles.refreshText}>Odśwież</Text>
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Ładowanie...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={loadStats}>
                  <Text style={styles.retryButtonText}>Spróbuj Ponownie</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats?.visits_count || 0}</Text>
                  <Text style={styles.statLabel}>Wizyty</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats?.rewards_used || 0}</Text>
                  <Text style={styles.statLabel}>Użyte Nagrody</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats?.points_awarded || 0}</Text>
                  <Text style={styles.statLabel}>Przyznane Punkty</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats?.capacity_percentage || 0}%</Text>
                  <Text style={styles.statLabel}>Pojemność</Text>
                </View>
              </View>
            )}
          </View>
        )}
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
});