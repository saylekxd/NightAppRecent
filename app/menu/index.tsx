import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getMenuItems, MenuItem } from '@/lib/menu';
import { MenuSkeleton } from '@/app/_components/ui/MenuSkeleton';

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState<'Drinki' | 'Shoty'>('Drinki');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMenuItems();
  }, [activeTab]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getMenuItems(activeTab);
      setMenuItems(items);
    } catch (err) {
      setError('Nie udało się załadować menu');
      console.error('Error loading menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Menu</Text>
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'Drinki' && styles.activeTab]} 
          onPress={() => setActiveTab('Drinki')}
        >
          <Text style={[styles.tabText, activeTab === 'Drinki' && styles.activeTabText]}>Drinki</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'Shoty' && styles.activeTab]} 
          onPress={() => setActiveTab('Shoty')}
        >
          <Text style={[styles.tabText, activeTab === 'Shoty' && styles.activeTabText]}>Shoty</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{activeTab}</Text>

        {loading ? (
          <MenuSkeleton count={4} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadMenuItems}>
              <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
            </Pressable>
          </View>
        ) : menuItems.length === 0 ? (
          <Text style={styles.emptyText}>Brak dostępnych pozycji w menu</Text>
        ) : (
          menuItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <Image 
                source={{ uri: item.image_url }} 
                style={styles.itemImage} 
                resizeMode="cover"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemPrice}>{item.price.toFixed(2)} zł</Text>
              </View>
            </View>
          ))
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
  contentContainer: {
    paddingBottom: 90,
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
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  activeTab: {
    backgroundColor: '#ff3b7f',
  },
  tabText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    height: 120,
  },
  itemImage: {
    width: 100,
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff3b7f',
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
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
}); 