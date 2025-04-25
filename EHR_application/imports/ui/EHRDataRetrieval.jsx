import React, { useEffect, useState } from "react";
import { Card, CardActionArea, CardContent, Typography, Box, CircularProgress } from "@mui/material";
import FHIRResourceCard from "./FHIRResourceCard";
import { Meteor } from "meteor/meteor";
import {CLIENT_SECRET} from "../../credentials/secrets.js"; 
import { fetchWithOfflineFallback } from '../utils/cache.js'; // Adjust the import path as necessary

export const EHRDataRetrieval = () => {
  const [clientSecret, setClientSecret] = useState(CLIENT_SECRET || "");
  const [medicalData, setMedicalData] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error("Error fetching medical data:", error);
    } finally {
      setLoading(false);
    }
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
            {medicalData.map((resource, index) => (
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
