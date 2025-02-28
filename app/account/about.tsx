import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';
  
  const openWebsite = () => {
    Linking.openURL('https://example.com');
  };
  
  const openTermsOfService = () => {
    Linking.openURL('https://example.com/terms');
  };
  
  const openPrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };
  
  const openInstagram = () => {
    Linking.openURL('https://instagram.com/example');
  };
  
  const openFacebook = () => {
    Linking.openURL('https://facebook.com/example');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'O Aplikacji',
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff'
      }} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.logoSection}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Night App</Text>
          <Text style={styles.versionText}>Wersja {appVersion} (build {buildNumber})</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O Nas</Text>
          <Text style={styles.descriptionText}>
            Night App to aplikacja lojalnościowa stworzona dla miłośników nocnego życia. 
            Zbieraj punkty za wizyty w klubach, wymieniaj je na ekskluzywne nagrody i bądź 
            na bieżąco z najlepszymi wydarzeniami w mieście.
          </Text>
          
          <Pressable style={styles.linkButton} onPress={openWebsite}>
            <Text style={styles.linkButtonText}>Odwiedź Naszą Stronę</Text>
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulaminy i Polityka</Text>
          
          <Pressable style={styles.menuItem} onPress={openTermsOfService}>
            <Text style={styles.menuItemText}>Regulamin Użytkowania</Text>
            <Ionicons name="arrow-forward" size={20} color="#666" />
          </Pressable>
          
          <Pressable style={styles.menuItem} onPress={openPrivacyPolicy}>
            <Text style={styles.menuItemText}>Polityka Prywatności</Text>
            <Ionicons name="arrow-forward" size={20} color="#666" />
          </Pressable>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Obserwuj Nas</Text>
          
          <View style={styles.socialContainer}>
            <Pressable style={styles.socialButton} onPress={openInstagram}>
              <Ionicons name="logo-instagram" size={28} color="#fff" />
              <Text style={styles.socialText}>Instagram</Text>
            </Pressable>
            
            <Pressable style={styles.socialButton} onPress={openFacebook}>
              <Ionicons name="logo-facebook" size={28} color="#fff" />
              <Text style={styles.socialText}>Facebook</Text>
            </Pressable>
          </View>
        </View>
        
        <View style={styles.creditsSection}>
          <Text style={styles.copyrightText}>© 2024 Night App. Wszelkie prawa zastrzeżone.</Text>
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
  scrollContainer: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    padding: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  versionText: {
    color: '#666',
    fontSize: 14,
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
  descriptionText: {
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 20,
  },
  linkButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff3b7f',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#ff3b7f',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  socialButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  socialText: {
    color: '#fff',
    marginTop: 5,
  },
  creditsSection: {
    padding: 30,
    alignItems: 'center',
  },
  copyrightText: {
    color: '#666',
    textAlign: 'center',
  },
}); 