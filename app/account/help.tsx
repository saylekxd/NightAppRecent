import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/auth';

// FAQs data
const faqs = [
  {
    question: 'Jak zdobywać punkty?',
    answer: 'Punkty możesz zdobywać poprzez regularne wizyty w klubie, udział w wydarzeniach oraz specjalnych promocjach. Za każdą wizytę otrzymujesz podstawową liczbę punktów, a dodatkowe punkty za korzystanie z usług premium.'
  },
  {
    question: 'Jak wymienić punkty na nagrody?',
    answer: 'Przejdź do zakładki Nagrody, wybierz interesującą Cię nagrodę i kliknij "Odbierz". Pamiętaj, że niektóre nagrody wymagają odbioru osobistego w klubie.'
  },
  {
    question: 'Dlaczego moje punkty wygasły?',
    answer: 'Punkty są ważne przez 12 miesięcy od daty ich zdobycia. Po tym czasie automatycznie wygasają. Zawsze sprawdzaj daty ważności w historii punktów.'
  },
  {
    question: 'Jak zmienić dane osobowe?',
    answer: 'Aby zmienić dane osobowe, przejdź do sekcji Profil, a następnie wybierz opcję "Edytuj profil". Tam możesz zaktualizować swoje dane.'
  },
  {
    question: 'Czy mogę przenieść moje punkty na inne konto?',
    answer: 'Nie, punkty są przypisane do konkretnego konta i nie mogą być przenoszone między użytkownikami.'
  },
];

export default function HelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };
  
  const submitSupportRequest = async () => {
    if (!supportMessage.trim()) {
      Alert.alert('Błąd', 'Proszę wprowadzić treść wiadomości');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get user profile to attach user ID to support request
      const profile = await getProfile();
      
      // Insert support request into Supabase
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: profile?.id,
          message: supportMessage,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          status: 'new',
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      Alert.alert(
        'Sukces',
        'Twoja wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.',
        [{ text: 'OK', onPress: resetForm }]
      );
    } catch (error) {
      Alert.alert('Błąd', 'Wystąpił problem podczas wysyłania wiadomości. Spróbuj ponownie później.');
      console.error('Error submitting support request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setSupportMessage('');
    setContactEmail('');
    setContactPhone('');
  };
  
  const callSupport = () => {
    Linking.openURL('tel:+48123456789');
  };
  
  const emailSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Pomoc i Wsparcie',
        headerStyle: { backgroundColor: '#000' },
        headerTintColor: '#fff'
      }} />
      
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Często zadawane pytania</Text>
          
          {faqs.map((faq, index) => (
            <Pressable 
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFaq(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons 
                  name={expandedFaq === index ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#ff3b7f" 
                />
              </View>
              
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </Pressable>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontakt z obsługą</Text>
          
          <TextInput
            style={[styles.messageInput, { minHeight: 120 }]}
            placeholder="Opisz swój problem..."
            placeholderTextColor="#666"
            multiline
            value={supportMessage}
            onChangeText={setSupportMessage}
            textAlignVertical="top"
          />
          
          <TextInput
            style={styles.contactInput}
            placeholder="Twój email (opcjonalnie)"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={contactEmail}
            onChangeText={setContactEmail}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.contactInput}
            placeholder="Twój numer telefonu (opcjonalnie)"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={contactPhone}
            onChangeText={setContactPhone}
          />
          
          <Pressable 
            style={[styles.contactButton, isSubmitting && styles.contactButtonDisabled]}
            onPress={submitSupportRequest}
            disabled={isSubmitting || !supportMessage.trim()}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.contactButtonText}>Wyślij wiadomość</Text>
            )}
          </Pressable>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactInfoText}>Lub skontaktuj się z nami bezpośrednio:</Text>
            
            {/* <Pressable 
              style={styles.contactMethod}
              onPress={callSupport}
            >
              <Ionicons name="call-outline" size={24} color="#ff3b7f" />
              <Text style={styles.contactMethodText}>+48 123 456 789</Text>
            </Pressable> */}
            
            <Pressable 
              style={styles.contactMethod}
              onPress={emailSupport}
            >
              <Ionicons name="mail-outline" size={24} color="#ff3b7f" />
              <Text style={styles.contactMethodText}>pomoc@klubnoc.com</Text>
            </Pressable>
          </View>
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
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 15,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  faqAnswer: {
    color: '#ccc',
    marginTop: 10,
    lineHeight: 20,
  },
  messageInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  contactInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
    height: 50,
  },
  contactButton: {
    backgroundColor: '#ff3b7f',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  contactButtonDisabled: {
    opacity: 0.5,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactInfo: {
    marginTop: 25,
  },
  contactInfoText: {
    color: '#fff',
    marginBottom: 15,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactMethodText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
}); 