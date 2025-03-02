import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { getActiveQRCode, QRCode as QRCodeType } from '@/lib/points';
import { Ionicons } from '@expo/vector-icons';
import { QRCodeSkeleton } from '@/app/components/SkeletonLoader';

const SCREEN_WIDTH = Dimensions.get('window').width;
const QR_SIZE = SCREEN_WIDTH * 0.6;

export default function QRCodeScreen() {
  const [qrCode, setQrCode] = useState<QRCodeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      const qrCodeData = await getActiveQRCode();
      setQrCode(qrCodeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <QRCodeSkeleton />;
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>Pokaż ten kod QR przy wejściu</Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={qrCode?.code || 'invalid'}
                size={QR_SIZE}
                color="#000"
                backgroundColor="#fff"
              />
            </View>

            <View style={styles.validityContainer}>
              <Text style={styles.validityTitle}>Ważny do</Text>
              <Text style={styles.validityTime}>
                {qrCode?.expires_at
                  ? new Date(qrCode.expires_at).toLocaleString('pl-PL')
                  : 'Brak danych'}
              </Text>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Jak używać</Text>
              <View style={styles.infoItem}>
                <Ionicons name="scan-outline" size={24} color="#ff3b7f" />
                <Text style={styles.infoText}>
                  Pokaż ten kod QR obsłudze przy wejściu
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={24} color="#ff3b7f" />
                <Text style={styles.infoText}>
                  Kod QR odnawia się co 24 godziny dla bezpieczeństwa
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#ff3b7f" />
                <Text style={styles.infoText}>
                  Każdy kod jest unikalny i powiązany z Twoim kontem
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
    paddingTop: 60,
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
  contentContainer: {
    paddingBottom: 90,
  },
});