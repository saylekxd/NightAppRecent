import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QRValidationResult } from '@/lib/admin';

interface Activity {
  id: string;
  name: string;
  points: number;
  description: string;
}

interface ScanResultProps {
  result: QRValidationResult;
  accepting: boolean;
  selectedActivity?: Activity;
  onAccept: () => void;
  onRetry: () => void;
  onSelectActivity: () => void;
}

const ScanResult = ({ 
  result, 
  accepting, 
  selectedActivity,
  onAccept, 
  onRetry,
  onSelectActivity 
}: ScanResultProps) => {
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
              <Text style={styles.infoLabel}>User:</Text>
              <Text style={styles.infoValue}>{result.data.user.full_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Points:</Text>
              <Text style={styles.infoValue}>{result.data.user.points}</Text>
            </View>
            
            {selectedActivity ? (
              <>
                <View style={styles.activityContainer}>
                  <Text style={styles.activityTitle}>Selected Activity</Text>
                  <View style={styles.activityCard}>
                    <View>
                      <Text style={styles.activityName}>{selectedActivity.name}</Text>
                      <Text style={styles.activityDescription}>
                        {selectedActivity.description}
                      </Text>
                    </View>
                    <View style={styles.pointsContainer}>
                      <Ionicons name="star" size={16} color="#ff3b7f" />
                      <Text style={styles.pointsText}>+{selectedActivity.points}</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <Pressable 
                style={styles.selectActivityButton}
                onPress={onSelectActivity}
              >
                <Ionicons name="add-circle-outline" size={24} color="#ff3b7f" />
                <Text style={styles.selectActivityText}>Select Activity</Text>
              </Pressable>
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
          {result.valid && selectedActivity && (
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
};

export default ScanResult;

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
  activityContainer: {
    marginTop: 20,
  },
  activityTitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#999',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,59,127,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: '#ff3b7f',
    fontWeight: '600',
  },
  selectActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,59,127,0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  selectActivityText: {
    color: '#ff3b7f',
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