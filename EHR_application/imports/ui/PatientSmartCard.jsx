import React from "react";
import { Card, CardContent, Typography, CardActions, Button, IconButton, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Updated import
import { MedicalServices, Info, Medication, HistoryEdu } from "@mui/icons-material";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const PatientSmartCard = ({ patient }) => {
  if (!patient || !patient.conditions) return <p>Loading...</p>;

  const navigate = useNavigate();

  handleScannerButton = () => {
    console.log("Scanner button clicked");
    navigate("/qr-scanner");
  };

  return (
    <div>

      <Typography variant="h5" align="center" gutterBottom>
        Medical Summary for {patient.name}
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
        {patient.conditions.map((condition, index) => (
          <Grid xs={12} sm={6} md={4} key={index} sx={{marginBottom: "16px"}}>
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: "10px",
                padding: "12px",
                background: "#f9f9f9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                  <MedicalServices sx={{ marginRight: 1, color: "#0077cc" }} />
                  {condition.diagnosis}
                </Typography>

                <Typography variant="body2">
                  <strong>Symptoms:</strong> {condition.symptoms.join(", ")}
                </Typography>

                <Typography variant="body2">
                  <strong>Medications:</strong> {condition.medications.join(", ")}
                </Typography>

                <Typography variant="body2">
                  <strong>Last Checkup:</strong> {new Date(condition.lastVisit).toDateString()}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Doctor Notes:</strong> {condition.notes}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between" }}>
                <IconButton color="primary" aria-label="more info">
                  <Info />
                </IconButton>
                <Button size="small" color="secondary" startIcon={<Medication />}>
                  Update Medication
                </Button>
                <IconButton color="success" aria-label="history">
                  <HistoryEdu />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      </div>
     
    </div>
  );
};

export default PatientSmartCard;
