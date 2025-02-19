import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Privacy & Security</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="key-outline" size={24} color="#fff" />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Change Password</Text>
                <Text style={styles.menuItemDescription}>
                  Update your account password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Two-Factor Authentication</Text>
                <Text style={styles.menuItemDescription}>
                  Add an extra layer of security
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Controls</Text>
          
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="eye-outline" size={24} color="#fff" />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Profile Visibility</Text>
                <Text style={styles.menuItemDescription}>
                  Control who can see your profile
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={24} color="#fff" />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Location Services</Text>
                <Text style={styles.menuItemDescription}>
                  Manage location tracking settings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="download-outline" size={24} color="#fff" />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Download Your Data</Text>
                <Text style={styles.menuItemDescription}>
                  Get a copy of your personal data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>

          <Pressable style={[styles.menuItem, styles.dangerItem]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="trash-outline" size={24} color="#ff3b7f" />
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, styles.dangerText]}>
                  Delete Account
                </Text>
                <Text style={styles.menuItemDescription}>
                  Permanently delete your account and data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </Pressable>
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
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  menuItemContent: {
    marginLeft: 15,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#999',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#ff3b7f',
  },
});