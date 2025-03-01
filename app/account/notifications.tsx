import { View, Text, StyleSheet, Switch, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/notifications';

interface NotificationSettings {
  newEvents: boolean;
  pointsEarned: boolean;
  rewardAvailable: boolean;
  specialOffers: boolean;
  newsletter: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newEvents: true,
    pointsEarned: true,
    rewardAvailable: true,
    specialOffers: false,
    newsletter: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getNotificationPreferences();
      
      // Ensure we have all the required properties with defaults
      const typedPrefs: NotificationSettings = {
        newEvents: prefs.newEvents ?? true,
        pointsEarned: prefs.pointsEarned ?? true,
        rewardAvailable: prefs.rewardAvailable ?? true,
        specialOffers: prefs.specialOffers ?? false,
        newsletter: prefs.newsletter ?? false,
      };
      
      setSettings(typedPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key],
      };
      
      setSettings(newSettings);
      await updateNotificationPreferences(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      // Revert the change if it failed
      loadPreferences();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>New Events</Text>
              <Text style={styles.settingDescription}>
                Get notified when new events are announced
              </Text>
            </View>
            <Switch
              value={settings.newEvents}
              onValueChange={() => toggleSetting('newEvents')}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Points Earned</Text>
              <Text style={styles.settingDescription}>
                Notifications when you earn points
              </Text>
            </View>
            <Switch
              value={settings.pointsEarned}
              onValueChange={() => toggleSetting('pointsEarned')}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reward Available</Text>
              <Text style={styles.settingDescription}>
                Get notified when you can claim a reward
              </Text>
            </View>
            <Switch
              value={settings.rewardAvailable}
              onValueChange={() => toggleSetting('rewardAvailable')}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Special Offers</Text>
              <Text style={styles.settingDescription}>
                Receive emails about special offers and promotions
              </Text>
            </View>
            <Switch
              value={settings.specialOffers}
              onValueChange={() => toggleSetting('specialOffers')}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Newsletter</Text>
              <Text style={styles.settingDescription}>
                Monthly newsletter with updates and featured events
              </Text>
            </View>
            <Switch
              value={settings.newsletter}
              onValueChange={() => toggleSetting('newsletter')}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor="#fff"
            />
          </View>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
  },
});