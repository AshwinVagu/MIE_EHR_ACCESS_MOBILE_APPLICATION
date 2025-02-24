import "webrtc-adapter";
import { Meteor } from "meteor/meteor";
import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PatientSmartCard from './PatientSmartCard.jsx';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const QRScanner = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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
      user_id: "12345",
      bundle_data: result,
      created_at: new Date(),
      updated_at: new Date()
    };
    try {
      const res = await Meteor.callAsync("bundleData.insert", payload);
      console.log("Data Added:", res);

      if (window.plugins && window.plugins.toast) {
        window.plugins.toast.showWithOptions(
          {
            message: "SMART Card added successfully!",
            duration: "short", // or 'long'
            position: "bottom",
          },
          () => navigate("/smart-card-reading"), // Success callback
          (err) => console.error("Toast failed", err) // Error callback
        );
      } else {
        console.error("Cordova toast plugin not available.");
      }

      navigate("/smart-card-reading");

    } catch (err) {
      console.log("Error:", err); 
      setError(err.message);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        Scan the QR code of your SMART Health Card!
      </Typography>

      <Button variant="contained" color="primary" onClick={scanQRCode}>
        Scan QR Code
      </Button>

      {result && <Typography variant="h5" gutterBottom>
        Preview of your card contents:
      </Typography>}

      {result && <PatientSmartCard data={result} />}

      {error && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          Error: {error}
        </Typography>
      )}

      <Button variant="contained" color="default" onClick={() => setResult(null)}>
        Reset Scanner
      </Button>

      {!result && <Typography align="center" variant="h5" color="gray" gutterBottom>
        Scan a SMART card and its preview will appear here.
      </Typography>}

      {result && (
        <Button variant="contained" color="secondary" onClick={addScannedCard}>
          Add SMART Card to Personal Data
        </Button>
      )}
    </Box>

  );
};

export default QRScanner;
