import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Html5Qrcode } from 'html5-qrcode';

interface WebScannerProps {
  onScan: (data: { type: string; data: string }) => void;
  onInitialized: (scanner: Html5Qrcode) => void;
  onError: (error: string) => void;
}

export function WebScanner({ onScan, onInitialized, onError }: WebScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'web-scanner-container';
  const isMounted = useRef(true);
  const isScanning = useRef(false);

  useEffect(() => {
    const initScanner = async () => {
      try {
        // Create scanner container if it doesn't exist
        let container = document.getElementById(containerId);
        if (!container) {
          container = document.createElement('div');
          container.id = containerId;
          container.style.width = '100%';
          container.style.height = '100%';
          document.getElementById('web-scanner-view')?.appendChild(container);
        }

        // Initialize scanner
        if (!scannerRef.current) {
          const scanner = new Html5Qrcode(containerId);
          scannerRef.current = scanner;
          if (isMounted.current) {
            onInitialized(scanner);
          }
        }

        // Start scanning
        if (scannerRef.current && !isScanning.current) {
          isScanning.current = true;
          await scannerRef.current.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            (decodedText) => {
              if (isMounted.current) {
                onScan({ type: 'qr', data: decodedText });
              }
            },
            () => {}
          );
        }
      } catch (err) {
        console.error('Scanner initialization error:', err);
        if (isMounted.current) {
          onError('Failed to start camera. Please check camera permissions.');
        }
      }
    };

    initScanner();

    return () => {
      isMounted.current = false;
      if (scannerRef.current && isScanning.current) {
        isScanning.current = false;
        scannerRef.current.stop().catch(() => {
          // Ignore stop errors during cleanup
        }).finally(() => {
          const container = document.getElementById(containerId);
          if (container) {
            container.remove();
          }
          scannerRef.current = null;
        });
      }
    };
  }, []);

  return <View id="web-scanner-view" style={styles.webScanner} />;
}

const styles = StyleSheet.create({
  webScanner: {
    width: '100%',
    height: '100%',
  },
});