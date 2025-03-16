import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';

interface CameraScannerProps {
  onScan: (data: { type: string; data: string }) => void;
  scanned: boolean;
}

export function CameraScanner({ onScan, scanned }: CameraScannerProps) {
  return (
    <CameraView
      style={StyleSheet.absoluteFillObject}
      facing="back"
      onBarcodeScanned={scanned ? undefined : onScan}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.targetBox} />
        <Text style={styles.scannerText}>
          Position the QR code within the frame
        </Text>
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  targetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ff3b7f',
    borderRadius: 20,
  },
  scannerText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
});