import React from "react";
import { Card, CardContent, Typography, CardActions, Button, Grid, IconButton } from "@mui/material";
import { MedicalServices, Info, Medication, HistoryEdu } from "@mui/icons-material";

const PatientSmartCard = ({ patient }) => {
  if (!patient || !patient.conditions) return <p>Loading...</p>;

  return (
    <div style={{ padding: "10px", maxWidth: "100%", margin: "0 auto" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Medical Summary for {patient.name}
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {patient.conditions.map((condition, index) => (
          <Grid item xs={12} sm={6} md={4} key={index} sx={{ marginBottom: "16px" }}>
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
  );
};

export default PatientSmartCard;
