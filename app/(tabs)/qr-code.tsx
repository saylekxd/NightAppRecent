import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { getActiveQRCode, getPointsBalance, QRCode as QRCodeType } from '@/lib/points';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const QR_SIZE = SCREEN_WIDTH * 0.6;

export default function QRCodeScreen() {
  const [qrCode, setQrCode] = useState<QRCodeType | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const [qrCodeData, pointsBalance] = await Promise.all([
        getActiveQRCode(),
        getPointsBalance(),
      ]);
      setQrCode(qrCodeData);
      setPoints(pointsBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Entry Pass</Text>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={20} color="#ff3b7f" />
            <Text style={styles.pointsText}>{points} points</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>Show this QR code at the entrance</Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={qrCode?.code || 'invalid'}
                size={QR_SIZE}
                color="#000"
                backgroundColor="#fff"
              />
            </View>

            <View style={styles.validityContainer}>
              <Text style={styles.validityTitle}>Valid Until</Text>
              <Text style={styles.validityTime}>
                {qrCode?.expires_at
                  ? new Date(qrCode.expires_at).toLocaleString()
                  : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>How to use</Text>
              <View style={styles.infoItem}>
                <Ionicons name="scan-outline" size={24} color="#ff3b7f" />
                <Text style={styles.infoText}>
                  Show this QR code to staff when entering
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={24} color="#ff3b7f" />
                <Text style={styles.infoText}>
                  QR code refreshes every 24 hours for security
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#ff3b7f" />
                <Text style={styles.infoText}>
                  Each code is unique and tied to your account
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
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
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 20,
  },
  pointsText: {
    color: '#ff3b7f',
    marginLeft: 5,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 40,
    textAlign: 'center',
  },
  qrContainer: {
    alignSelf: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#ff3b7f',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  validityContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  validityTitle: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 5,
  },
  validityTime: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  errorContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b7f',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});