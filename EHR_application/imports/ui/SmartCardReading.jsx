import React, { useState } from 'react';
import PatientSmartCard from "./PatientSmartCard";
import { MedicalServices, Info, Medication, HistoryEdu } from "@mui/icons-material";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, CardActions, Button, IconButton, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Updated import

export const SmartCardReading = () => {

  // if (!patient || !patient.conditions) return <p>Loading...</p>;

  const navigate = useNavigate();

  handleScannerButton = () => {
    console.log("Scanner button clicked");
    navigate("/qr-scanner");
  };

  const patientData = [];

  return (
    <div>
    
      <Typography variant="h5" align="center" gutterBottom>
        Medical Summary for Patient
      </Typography>
      <Stack spacing={2} direction="column" sx={{ maxWidth: 300, margin: "20px auto" }}>
      <Button
        variant="contained"
        color="primary"
        // onClick={() => handleButtonClick("Button 1")}
      >
        Add Health Record Data
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleScannerButton()}
      >
        Scan SMART Card
      </Button>
    </Stack>
    <div style={{ padding: "10px", maxWidth: "100%", margin: "0 auto" }}>

      <Grid container sx={{ gap: 2 }} justifyContent="center">
        {patientData.map((condition, index) => (
          <Grid xs={12} sm={6} md={4} key={index} sx={{marginBottom: "16px"}}>
            
          </Grid>
        ))}
      </Grid>
      </div>
     
     {/* <PatientSmartCard patient={patientData} /> */}
    </div>
  );
};