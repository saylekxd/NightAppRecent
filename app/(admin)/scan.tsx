import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { validateQRCode, acceptVisit, QRValidationResult } from '@/lib/admin';
import { useCameraPermissions } from 'expo-camera';
import WebScanner from './scanner/components/WebScanner';
import CameraScanner from './scanner/components/CameraScanner';
import ScanResult from './scanner/components/ScanResult';
import ActivitySelector from './scanner/components/ActivitySelector';
import ErrorView from './scanner/components/ErrorView';
import PermissionDenied from './scanner/components/PermissionDenied';

interface Activity {
  id: string;
  name: string;
  points: number;
  description: string;
}

const ScanScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<QRValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [webScanner, setWebScanner] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setError(null);
        setIsInitializing(true);

        if (Platform.OS === 'web') {
          // Web permissions are handled differently
        } else {
          if (!permission?.granted) {
            const result = await requestPermission();
            if (mounted && !result.granted) {
              setError('Camera permission was denied');
            }
          }
        }
      } catch (err) {
        console.error('Scanner initialization error:', err);
        if (mounted) {
          setError('Failed to initialize scanner');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (Platform.OS === 'web' && webScanner) {
        webScanner.stop().catch(console.error);
      }
    };
  }, [permission, requestPermission]);

  const handleScan = async ({ type, data }: { type: string; data: string }) => {
    if (!data || scanned) return;

    try {
      setScanned(true);
      setError(null);
      setScannedCode(data);
      setShowActivitySelector(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate QR code');
      setScanned(false);
    }
  };

  const handleActivitySelect = async (activity: Activity) => {
    if (!scannedCode) return;

    try {
      setShowActivitySelector(false);
      const validationResult = await validateQRCode(scannedCode, activity.name);
      setResult(validationResult);
      setSelectedActivity(activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate QR code');
      setScanned(false);
    }
  };

  const handleAccept = async () => {
    if (!result?.valid || !result.data || !selectedActivity) return;

    try {
      setAccepting(true);
      setError(null);

      await acceptVisit(result.data.code, selectedActivity.name);

      // Show success message and navigate back after a delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept code');
      setScanned(false); // Allow rescanning on error
    } finally {
      setAccepting(false);
    }
  };

  const handleClose = () => {
    if (Platform.OS === 'web' && webScanner) {
      webScanner.stop().catch(console.error);
    }
    router.back();
  };

  const handleRetry = () => {
    setScanned(false);
    setError(null);
    setResult(null);
    setSelectedActivity(null);
    setScannedCode(null);
    
    if (Platform.OS === 'web' && webScanner) {
      webScanner.resume().catch(console.error);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#000']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.text}>Initializing scanner...</Text>
      </View>
    );
  }

  if (!permission?.granted && Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a1a', '#000']}
          style={StyleSheet.absoluteFill}
        />
        <PermissionDenied />
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
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Scan QR Code</Text>
      </View>

      {!scanned && (permission?.granted || Platform.OS === 'web') && (
        <View style={styles.scannerContainer}>
          {Platform.OS === 'web' ? (
            <WebScanner
              onScan={handleScan}
              onInitialized={setWebScanner}
              onError={setError}
            />
          ) : (
            <CameraScanner
              onScan={handleScan}
              scanned={scanned}
            />
          )}
        </View>
      )}

      {error && (
        <ErrorView
          message={error}
          onRetry={handleRetry}
        />
      )}

      {showActivitySelector && (
        <ActivitySelector
          onSelect={handleActivitySelect}
          onCancel={() => {
            setShowActivitySelector(false);
            setScanned(false);
            setScannedCode(null);
          }}
        />
      )}

      {result && (
        <ScanResult
          result={result}
          accepting={accepting}
          selectedActivity={selectedActivity ?? undefined}
          onAccept={handleAccept}
          onRetry={handleRetry}
          onSelectActivity={() => setShowActivitySelector(true)}
        />
      )}
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  scannerContainer: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});