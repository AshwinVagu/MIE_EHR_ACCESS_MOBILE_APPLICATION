import React, { useState, useEffect } from 'react';
import PatientSmartCard from "./PatientSmartCard";
import { MedicalServices, Info, Medication, HistoryEdu } from "@mui/icons-material";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, CardActions, Button, IconButton, Stack, Box } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Updated import
import { fetchWithOfflineFallback } from '../utils/cache.js';
import { RESOURCE_TYPES } from "../metadata_jsons/fhir_token_options"; 

export const SmartCardReading = () => {

  // if (!patient || !patient.conditions) return <p>Loading...</p>;

  const navigate = useNavigate();
  
  const [patientData, setPatientData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  handleScannerButton = () => {
    navigate("/qr-scanner");
  };

  handleHealthRecordAddition= () => {
    navigate("/ehr-data-retrieval");
  };

  const applyFilters = () => {
    const lowerSearch = searchTerm.toLowerCase();
  
    const filtered = patientData.filter((entry) => {
      const bundle = entry.bundle_data?.payload?.vc?.credentialSubject?.fhirBundle;
  
      if (!bundle || !Array.isArray(bundle.entry)) return false;
  
      const entries = bundle.entry;
  
      let matchesSearch = true;
      let matchesType = true;
  
      // Search: check if any resource matches the search term
      matchesSearch = !searchTerm || entries.some((e) =>
        JSON.stringify(e.resource || {}).toLowerCase().includes(lowerSearch)
      );
  
      // Resource Type: check if any resource is of selected type
      matchesType = !resourceType || entries.some((e) =>
        e.resource?.resourceType === resourceType
      );
  
      return matchesSearch && matchesType;
    });
  
    setFilteredData(filtered);
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
        setFilteredData(res);
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

    <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        sx={{ maxWidth: 300, margin: "20px auto" }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "left" }}>
            Filters:
        </Typography>
        {/* Search Field */}
        <Box sx={{ marginBottom: 2}}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Search</label>
          <input
            type="text"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </Box>

        {/* Resource Type Dropdown */}
        <Box sx={{ marginBottom: 2}}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Resource Type</label>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="">All Resource Types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setResourceType("");
              setFilteredData(patientData);
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Reset
          </button>
        </Box>
      </Box>

    {patientData.length==0 && <Typography align="center" variant="h5" color="gray" gutterBottom>
        You have no cards added yet! Scan or manually add your health data.
      </Typography>}
    <div style={{ padding: "10px", maxWidth: "100%", margin: "0 auto" }}>

      <Grid container sx={{ gap: 2 }} justifyContent="center">
        {filteredData.map((item, index) => (
          <Grid xs={12} sm={6} md={4} key={index}>
            <PatientSmartCard data={item['bundle_data']} objectId={item['_id']} />
          </Grid>
        ))}
      </Grid>
      </div>
     
    </div>
  );
};