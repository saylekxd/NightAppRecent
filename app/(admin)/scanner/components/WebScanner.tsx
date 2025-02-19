import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Html5Qrcode } from 'html5-qrcode';

interface WebScannerProps {
  onScan: (data: { type: string; data: string }) => void;
  onInitialized: (scanner: Html5Qrcode) => void;
  onError: (error: string) => void;
}

const WebScanner = ({ onScan, onInitialized, onError }: WebScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      try {
        // Create scanner container if it doesn't exist
        let container = document.getElementById('web-scanner');
        if (!container) {
          container = document.createElement('div');
          container.id = 'web-scanner';
          document.body.appendChild(container);
        }

        const scanner = new Html5Qrcode('web-scanner');
        scannerRef.current = scanner;
        onInitialized(scanner);

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => onScan({ type: 'qr', data: decodedText }),
          () => {}
        );
      } catch (err) {
        onError('Failed to start camera. Please check camera permissions.');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
        const container = document.getElementById('web-scanner');
        if (container) {
          container.remove();
        }
      }
    };
  }, []);

  return <View id="web-scanner" style={styles.webScanner} />;
};

const styles = StyleSheet.create({
  webScanner: {
    width: '100%',
    height: '100%',
  },
});

export default WebScanner;