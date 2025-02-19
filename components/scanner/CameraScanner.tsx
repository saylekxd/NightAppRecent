import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface CameraScannerProps {
  onScan: (data: { type: string; data: string }) => void;
  scanned: boolean;
}

export function CameraScanner({ onScan, scanned }: CameraScannerProps) {
  return (
    <Camera
      style={StyleSheet.absoluteFillObject}
      type={CameraType.back}
      onBarCodeScanned={scanned ? undefined : onScan}
      barCodeScannerSettings={{
        barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.targetBox} />
        <Text style={styles.scannerText}>
          Position the QR code within the frame
        </Text>
      </View>
    </Camera>
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