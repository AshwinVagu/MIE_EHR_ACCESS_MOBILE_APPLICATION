import React, { useEffect, useState } from "react";
import { Card, CardActionArea, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import FHIRResourceCard from "./FHIRResourceCard";
import { Meteor } from "meteor/meteor";
import {CLIENT_SECRET} from "../../credentials/secrets.js"; 
import { fetchWithOfflineFallback } from '../utils/cache.js'; // Adjust the import path as necessary
import { RESOURCE_TYPES } from "../metadata_jsons/fhir_token_options"; // Adjust the import path as necessary

export const EHRDataRetrieval = () => {
  const [clientSecret, setClientSecret] = useState(CLIENT_SECRET || "");
  const [medicalData, setMedicalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const authBaseURL = "https://ashwinvagu.webch.art";
  const clientID = "MIE-localhost";

  // Fetch data on page load (not dependent on client secret)
  useEffect(() => {
    if (!clientSecret) {
      const userSecret = prompt("Enter the client secret:");
      if (userSecret) setClientSecret(userSecret);
    }

    fetchMedicalData();
  }, []);

  const fetchMedicalData = async () => {
    setLoading(true);
    try {
      const userProfile = JSON.parse(localStorage.getItem("user_profile"));
      const user_id = userProfile?.user_id;
      const cacheKey = `medical_fhir_data_cacheKey`;

      const { data: records } = await fetchWithOfflineFallback(
        cacheKey,
        () => Meteor.callAsync("resourceData.getByUserId", user_id)
      );

      console.log("Fetched records:", records);
      // Extract only the resource_data field for FHIRResourceCard
      setMedicalData(records);
      setFilteredData(records);
    } catch (error) {
      console.error("Error fetching medical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const lowerSearch = searchTerm.toLowerCase();
  
    const filtered = medicalData.filter((entry) => {
      const res = entry.resource_data;
      let matchesSearch = true;
      let matchesFrom = true;
      let matchesTo = true;
      let matchesType = true; 
  
      // Match search term against all displayable fields (case-insensitive string match)
      const searchableString = JSON.stringify(res).toLowerCase();
      matchesSearch = !searchTerm || searchableString.includes(lowerSearch);
  
      // Date range filter (inclusive)
      const recordedDate = new Date(res.recordedDate);
      matchesFrom = !fromDate || recordedDate >= new Date(fromDate);
      matchesTo = !toDate || recordedDate <= new Date(toDate);
  
      // Resource type filter
      matchesType = !resourceType || res.resourceType === resourceType;
  
      return matchesSearch && matchesFrom && matchesTo && matchesType;
    });
  
    setFilteredData(filtered);
  };
  

  const handleAuth = () => {
    if (!clientSecret) {
      alert("Client Secret is required to proceed.");
      return;
    }

    window.location.href = `${authBaseURL}/webchart.cgi/oauth/authenticate/?response_type=code&client_id=${clientID}&redirect_uri=${window.location.origin}/code&scope=launch/patient openid fhirUser offline_access patient/*.read&state=secure_random_state&aud=${authBaseURL}/webchart.cgi`;
  };

  return (
    <Box sx={{ padding: 2, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Authentication Card (Full Width on Mobile) */}
      <Card 
        sx={{
          width: "100%", 
          maxWidth: 400, 
          borderRadius: 3, 
          boxShadow: 3, 
          marginBottom: 3, 
          backgroundColor: "#f8f9fa"
        }}
      >
        <CardActionArea sx={{ display: "flex", alignItems: "center", padding: 2 }} onClick={handleAuth}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: 18, fontWeight: "bold" }}>
            Get Data from WebChart
          </Typography>
          <Box
            component="img"
            sx={{ width: 50, height: "auto", marginLeft: 1 }}
            src="https://www.webchartnow.com/gfx/png/wc_logo_full.png"
            alt="WebChart Logo"
          />
        </CardActionArea>
      </Card>


      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        sx={{ width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "left" }}>
            Filters:
        </Typography>
        {/* Search Field */}
        <Box>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Search</label>
          <input
            type="text"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </Box>

        {/* Date Range Fields */}
        <Box sx={{ flex: 1 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              WebkitAppearance: "none",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              WebkitAppearance: "none",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </Box>

        {/* Resource Type Dropdown */}
        <Box>
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
              setFromDate("");
              setToDate("");
              setResourceType("");
              setFilteredData(medicalData);
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

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Display Retrieved Data */}
      {!loading && medicalData.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: 500 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}>
            Your Electronic Health Record Data
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredData.map((resource, index) => (
            <FHIRResourceCard key={index} resource={resource.resource_data} resourceId={resource.fhir_id}/>
          ))}
          </Box>
        </Box>
      )}

      {/* No Data Message */}
      {!loading && medicalData.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: "center", marginTop: 3, fontSize: 16 }}>
          No medical data available.
        </Typography>
      )}
    </Box>
  );
};
