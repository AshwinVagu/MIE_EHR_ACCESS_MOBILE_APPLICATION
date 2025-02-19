import "webrtc-adapter";
import { Meteor } from "meteor/meteor";
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PatientSmartCard from './PatientSmartCard.jsx';

const QRScanner = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scanQRCode = () => {
    if (!window.cordova || !window.cordova.plugins || !window.cordova.plugins.barcodeScanner) {
      setError("Cordova BarcodeScanner plugin is not available.");
      return;
    }

    window.cordova.plugins.barcodeScanner.scan(
      (res) => {
        if (res.text) {
          decodeScannedData(res.text);  
        }
      },
      (err) => {
        setError(err.message);
      },
      {
        preferFrontCamera: false,
        showFlipCameraButton: true,
        showTorchButton: true,
        torchOn: false,
        prompt: "Place a QR code inside the scan area",
        resultDisplayDuration: 500,
        formats: "QR_CODE",
        orientation: "portrait",
      }
    );
  };

  const decodeScannedData = async (decodedText) => {  
    try {
      const res = await Meteor.callAsync("decryptScannedData", decodedText);
      const parsedData = typeof res === 'string' ? JSON.parse(res) : res;
      console.log("Decrypted Data:", parsedData);
      setResult(parsedData);
    } catch (err) {
      setError(err.message);
    }
  };

  const addScannedCard = async () => {
    let payload = {
      user_id: "1234567890",
      bundle_data: result,
      created_at: new Date(),
      updated_at: new Date()
    };
    try {
      const res = await Meteor.callAsync("bundleData.insert", payload);
      // const parsedData = typeof res === 'string' ? JSON.parse(res) : res;
      console.log("Data Added:", res);
    } catch (err) {
      console.log("Error:", err); 
      setError(err.message);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h5" gutterBottom>
        QR Code Scanner
      </Typography>

      <Button variant="contained" color="primary" onClick={scanQRCode}>
        Scan QR Code
      </Button>

      {result && <PatientSmartCard data={result} />}

      {error && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          Error: {error}
        </Typography>
      )}

      <Button variant="contained" color="default" onClick={() => setResult(null)}>
        Reset Scanner
      </Button>

      {result && (
        <Button variant="contained" color="secondary" onClick={addScannedCard}>
          Add SMART Card to Personal Data
        </Button>
      )}
    </Box>

  );
};

export default QRScanner;
