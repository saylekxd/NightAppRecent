import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { getProfile, updateProfile } from '@/lib/auth';

const AVATARS = [
  {
    id: 'default',
    url: 'https://rwxzctowvxylopuzpsti.supabase.co/storage/v1/object/sign/images/shine%20safe%20tonight.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvc2hpbmUgc2FmZSB0b25pZ2h0LnBuZyIsImlhdCI6MTc0MjIzNTQ1NCwiZXhwIjoxODk5OTE1NDU0fQ.PLeHDCtTkHKMTLtMJcN2Smc2k-Ma7fxq97QJ2qxLU0I',
  },
  {
    id: 'avatar1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
  },
  {
    id: 'avatar2',
    url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=800',
  },
  {
    id: 'avatar3',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
  },
  {
    id: 'avatar4',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  },
  {
    id: 'avatar5',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
  },
  {
    id: 'avatar6',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
  },
  {
    id: 'avatar7',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
  },
  {
    id: 'avatar8',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800',
  },
];

export default function AvatarScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      const profile = await getProfile();
      setSelectedAvatar(profile.avatar_url || AVATARS[0].url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;
    
    try {
      setError(null);
      setSaving(true);
      await updateProfile({ avatar_url: selectedAvatar });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Choose Avatar</Text>
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || !selectedAvatar}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <Pressable
              key={avatar.id}
              style={[
                styles.avatarItem,
                selectedAvatar === avatar.url && styles.selectedAvatarItem,
              ]}
              onPress={() => setSelectedAvatar(avatar.url)}>
              <Image
                source={{ uri: avatar.url }}
                style={styles.avatarImage}
              />
            </Pressable>
          ))}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  avatarItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 10,
  },
  selectedAvatarItem: {
    transform: [{ scale: 0.95 }],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
});