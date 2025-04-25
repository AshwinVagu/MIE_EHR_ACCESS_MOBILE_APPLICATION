import React, { useState, useEffect } from 'react';
import PatientSmartCard from "./PatientSmartCard";
import { MedicalServices, Info, Medication, HistoryEdu } from "@mui/icons-material";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, CardActions, Button, IconButton, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Updated import
import { fetchWithOfflineFallback } from '../utils/cache.js';

export const SmartCardReading = () => {

  // if (!patient || !patient.conditions) return <p>Loading...</p>;

  const navigate = useNavigate();
  
  const [patientData, setPatientData] = useState([]);

  handleScannerButton = () => {
    navigate("/qr-scanner");
  };

  handleHealthRecordAddition= () => {
    navigate("/ehr-data-retrieval");
  };

  useEffect(() => { 
    async function fetchData() {
      try {
        const userProfile = JSON.parse(localStorage.getItem("user_profile"));
        const user_id = userProfile?.user_id;

        const cacheKey = `medical_smart_card_data_cacheKey`;

        const { data: res } = await fetchWithOfflineFallback(
          cacheKey,
          () => Meteor.callAsync("bundleData.getByUserId", user_id)
        );

        setPatientData(res);
      } catch (err) {
        console.log("Error:", err); 
      }
    }  
    fetchData();
  }, []);


  return (
    <div>
    
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }} gutterBottom>
        Your Scanned SMART Health Cards
      </Typography>
      <Stack spacing={2} direction="column" sx={{ maxWidth: 300, margin: "20px auto" }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleHealthRecordAddition()}
        sx={{ fontWeight: 'bold' }}
      >
        Add Health Record Data
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleScannerButton()}
        sx={{ fontWeight: 'bold' }}
      >
        Scan SMART Card
      </Button>
    </Stack>

    {patientData.length==0 && <Typography align="center" variant="h5" color="gray" gutterBottom>
        You have no cards added yet! Scan or manually add your health data.
      </Typography>}
    <div style={{ padding: "10px", maxWidth: "100%", margin: "0 auto" }}>

      <Grid container sx={{ gap: 2 }} justifyContent="center">
        {patientData.map((item, index) => (
          <Grid xs={12} sm={6} md={4} key={index}>
            <PatientSmartCard data={item['bundle_data']} objectId={item['_id']} />
          </Grid>
        ))}
      </Grid>
      </div>
     
    </div>
  );
};