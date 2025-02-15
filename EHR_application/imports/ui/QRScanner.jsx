import 'webrtc-adapter';
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Box, Typography, Button } from '@mui/material';

const QRScanner = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  return (
    <Box sx={{ textAlign: 'center', marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        QR Code Scanner
      </Typography>

      {/* QR Code Scanner */}
      <Box sx={{ width: 300, height: 300, margin: 'auto' }}>
        <QrReader
          constraints={{ facingMode: 'environment' }} // Rear camera for mobile
          scanDelay={500}
          onResult={(decodedText, error) => {
            if (decodedText) {
              setResult(decodedText.text);
            }
            if (error) {
              setError(error?.message);
            }
          }}
          style={{ width: '100%' }}
        />
      </Box>

      {/* Display Scan Result */}
      {result && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          <strong>QR Code Data:</strong> {result}
        </Typography>
      )}

      {/* Display Error Message */}
      {error && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          Error: {error}
        </Typography>
      )}

      {/* Reset Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 3 }}
        onClick={() => {
          setResult(null);
          setError(null);
        }}
      >
        Reset Scanner
      </Button>
    </Box>
  );
};

export default QRScanner;
