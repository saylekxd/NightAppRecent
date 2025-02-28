import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PreferencesScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [language, setLanguage] = useState('Polski');
  
  // Load preferences from storage on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPreferences = await AsyncStorage.getItem('userPreferences');
        if (storedPreferences) {
          const preferences = JSON.parse(storedPreferences);
          setDarkMode(preferences.darkMode ?? true);
          setPushEnabled(preferences.pushEnabled ?? true);
          setEmailEnabled(preferences.emailEnabled ?? true);
          setLanguage(preferences.language ?? 'Polski');
        }
      } catch (error) {
        console.error('Failed to load preferences', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save preferences when they change
  useEffect(() => {
    const savePreferences = async () => {
      try {
        const preferences = {
          darkMode,
          pushEnabled,
          emailEnabled,
          language
        };
        await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save preferences', error);
      }
    };
    
    savePreferences();
  }, [darkMode, pushEnabled, emailEnabled, language]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Preferencje',
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff'
      }} />
      
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wygląd</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Tryb Ciemny</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Powiadomienia</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Powiadomienia Push</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor={'#fff'}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>Powiadomienia Email</Text>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#333', true: '#ff3b7f' }}
              thumbColor={'#fff'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Język</Text>
          
          <Pressable 
            style={styles.languageItem}
            onPress={() => setLanguage('Polski')}
          >
            <Text style={styles.preferenceText}>Polski</Text>
            {language === 'Polski' && (
              <Ionicons name="checkmark" size={24} color="#ff3b7f" />
            )}
          </Pressable>
          
          <Pressable 
            style={styles.languageItem}
            onPress={() => setLanguage('English')}
          >
            <Text style={styles.preferenceText}>English</Text>
            {language === 'English' && (
              <Ionicons name="checkmark" size={24} color="#ff3b7f" />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  preferenceText: {
    color: '#fff',
    fontSize: 16,
  },
}); 