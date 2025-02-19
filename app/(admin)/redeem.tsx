import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { acceptReward } from '@/lib/admin';

export default function RedeemScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    if (code.length !== 3) {
      setError('Please enter the last 3 characters of the code');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setSuccess(false);
      
      // Find redemption by last 3 characters
      await acceptReward(code.trim());
      setSuccess(true);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  // Only allow 3 characters
  const handleCodeChange = (text: string) => {
    if (text.length <= 3) {
      setCode(text.toLowerCase());
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Redeem Reward</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Last 3 Characters</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successText}>Reward redeemed successfully!</Text>
            </View>
          )}

          <View style={styles.codeInputContainer}>
            <Text style={styles.codePrefix}>XXXX-XXXX-XXXX-</Text>
            <TextInput
              style={styles.codeInput}
              placeholder="XXX"
              placeholderTextColor="#666"
              value={code}
              onChangeText={handleCodeChange}
              maxLength={3}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
            />
          </View>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRedeem}
            disabled={loading || code.length !== 3}>
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : 'Redeem'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Instructions</Text>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={24} color="#ff3b7f" />
            <Text style={styles.infoText}>
              Enter only the last 3 characters of the customer's redemption code.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="warning" size={24} color="#ff3b7f" />
            <Text style={styles.infoText}>
              Once redeemed, the code cannot be used again.
            </Text>
          </View>
        </View>
      </View>
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
    padding: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  codePrefix: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  codeInput: {
    flex: 1,
    color: '#ff3b7f',
    fontSize: 16,
    padding: 15,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ff3b7f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    color: '#fff',
    opacity: 0.8,
    marginLeft: 10,
    flex: 1,
  },
});