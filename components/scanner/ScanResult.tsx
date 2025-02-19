import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QRValidationResult } from '@/lib/admin';

interface ScanResultProps {
  result: QRValidationResult;
  accepting: boolean;
  onAccept: () => void;
  onRetry: () => void;
}

export function ScanResult({ result, accepting, onAccept, onRetry }: ScanResultProps) {
  return (
    <View style={styles.resultContainer}>
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons
            name={result.valid ? 'checkmark-circle' : 'close-circle'}
            size={48}
            color={result.valid ? '#4CAF50' : '#F44336'}
          />
          <Text style={[
            styles.resultTitle,
            { color: result.valid ? '#4CAF50' : '#F44336' }
          ]}>
            {accepting ? 'Processing...' : result.valid ? 'Valid Code' : 'Invalid Code'}
          </Text>
        </View>

        {result.valid && result.data && (
          <View style={styles.resultInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>
                {result.data.type === 'visit' ? 'Entry Pass' : 'Reward Redemption'}
              </Text>
            </View>
            {result.data.type === 'visit' && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>User:</Text>
                  <Text style={styles.infoValue}>{result.data.user.full_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Points:</Text>
                  <Text style={styles.infoValue}>{result.data.user.points}</Text>
                </View>
              </>
            )}
            {result.data.type === 'reward' && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reward:</Text>
                  <Text style={styles.infoValue}>{result.data.reward.title}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>User:</Text>
                  <Text style={styles.infoValue}>{result.data.user.full_name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Expires:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(result.data.expires_at).toLocaleDateString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.resultActions}>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={onRetry}
            disabled={accepting}>
            <Text style={styles.buttonText}>Scan Another</Text>
          </Pressable>
          {result.valid && (
            <Pressable
              style={[styles.button, accepting && styles.buttonDisabled]}
              onPress={onAccept}
              disabled={accepting}>
              <Text style={styles.buttonText}>
                {accepting ? 'Processing...' : 'Accept'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  resultInfo: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    color: '#999',
    fontSize: 16,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});