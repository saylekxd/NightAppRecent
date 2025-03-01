import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Notification, sendNotification } from '@/lib/notifications';
import Toast from 'react-native-toast-message';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationForm {
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
  isBroadcast: boolean;
  selectedUsers: string[];
}

export default function NotificationsManagerScreen() {
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    type: 'info',
    link: '',
    isBroadcast: true,
    selectedUsers: []
  });

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    try {
      setSending(true);
      
      // Validate form
      if (!form.title.trim() || !form.body.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please fill in all required fields'
        });
        return;
      }

      // If broadcasting, send to all users
      if (form.isBroadcast) {
        await sendNotification({
          type: form.type,
          title: form.title,
          body: form.body,
          link: form.link
        });
      } else {
        // Send to selected users
        for (const userId of form.selectedUsers) {
          await sendNotification({
            type: form.type,
            title: form.title,
            body: form.body,
            link: form.link,
            recipient_id: userId
          });
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Notification sent successfully'
      });

      // Reset form
      setForm({
        title: '',
        body: '',
        type: 'info',
        link: '',
        isBroadcast: true,
        selectedUsers: []
      });

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send notification'
      });
    } finally {
      setSending(false);
    }
  };

  const NotificationTypeButton = ({ type, label }: { type: NotificationType, label: string }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        form.type === type && styles.typeButtonSelected,
        { borderColor: getTypeColor(type) }
      ]}
      onPress={() => setForm(prev => ({ ...prev, type }))}
    >
      <Ionicons 
        name={getTypeIcon(type)} 
        size={20} 
        color={form.type === type ? '#fff' : getTypeColor(type)} 
      />
      <Text style={[
        styles.typeButtonText,
        form.type === type && styles.typeButtonTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case 'info': return '#3498db';
      case 'success': return '#2ecc71';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return 'information-circle';
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      default: return 'notifications';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications Manager',
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Notification Type</Text>
        <View style={styles.typeButtons}>
          <NotificationTypeButton type="info" label="Info" />
          <NotificationTypeButton type="success" label="Success" />
          <NotificationTypeButton type="warning" label="Warning" />
          <NotificationTypeButton type="error" label="Error" />
        </View>

        <Text style={styles.sectionTitle}>Recipients</Text>
        <View style={styles.recipientToggle}>
          <Text style={styles.recipientText}>Send to all users</Text>
          <Switch
            value={form.isBroadcast}
            onValueChange={(value) => setForm(prev => ({ ...prev, isBroadcast: value }))}
            trackColor={{ false: '#333', true: '#2ecc71' }}
            thumbColor={form.isBroadcast ? '#fff' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.sectionTitle}>Content</Text>
        <TextInput
          style={styles.input}
          placeholder="Notification Title"
          placeholderTextColor="#666"
          value={form.title}
          onChangeText={(title) => setForm(prev => ({ ...prev, title }))}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notification Message"
          placeholderTextColor="#666"
          value={form.body}
          onChangeText={(body) => setForm(prev => ({ ...prev, body }))}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Optional Link</Text>
        <TextInput
          style={styles.input}
          placeholder="Link (e.g., /rewards)"
          placeholderTextColor="#666"
          value={form.link}
          onChangeText={(link) => setForm(prev => ({ ...prev, link }))}
        />

        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendingButton]}
          onPress={handleSend}
          disabled={sending}
        >
          <Ionicons name={sending ? 'sync' : 'paper-plane'} size={20} color="#fff" />
          <Text style={styles.sendButtonText}>
            {sending ? 'Sending...' : 'Send Notification'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#1e1e1e',
  },
  typeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  typeButtonTextSelected: {
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  recipientToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  recipientText: {
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#ff3b7f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  sendingButton: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 