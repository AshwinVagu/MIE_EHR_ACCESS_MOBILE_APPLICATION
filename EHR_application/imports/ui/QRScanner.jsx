import 'webrtc-adapter';
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Box, Typography, Button } from '@mui/material';
import PatientSmartCard from './PatientSmartCard.jsx';

const QRScanner = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  decodeScannedData = async (decodedText) => {
    try {
      const res = await Meteor.callAsync("decryptScannedData", decodedText);
      const parsedData = typeof res === 'string' ? JSON.parse(res) : res;
      console.log("Decrypted Data:", parsedData);
      setResult(parsedData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        QR Code Scanner
      </Typography>
      <Box sx={{ width: 300, height: 300, margin: 'auto' }}>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          scanDelay={500}
          onResult={(decodedText, err) => {
            if (decodedText) decodeScannedData(decodedText.text);
            if (err) setError(err.message);
          }}
          style={{ width: '100%' }}
        />
      </Box>
      {result && <PatientSmartCard data={result} />}
      {error && <Typography color="error" sx={{ marginTop: 2 }}>Error: {error}</Typography>}
      <Button variant="contained" color="primary" sx={{ marginTop: 3 }} onClick={() => { setResult(null); setError(null); }}>
        Reset Scanner
      </Button>
    </Box>
  );
};

export default QRScanner;
