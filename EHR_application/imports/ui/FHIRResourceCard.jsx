import React, { useState } from "react";
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Button, Dialog, DialogContent } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { QRCodeSVG } from "qrcode.react";
import { Meteor } from "meteor/meteor";

/**
 * Converts camelCase to properly spaced words.
 */
const formatCamelCase = (text) => {
    return text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (str) => str.toUpperCase());
};

/**
 * Renders values properly, including hierarchical lists.
 */
const renderValue = (value) => {
    if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
            return (
                <List dense>
                    {value.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemText primary={renderValue(item)} />
                        </ListItem>
                    ))}
                </List>
            );
        } else {
            return (
                <Box sx={{ paddingLeft: 2 }}>
                    {Object.entries(value).map(([subKey, subValue], index) => (
                        <Box key={index} sx={{ marginBottom: 1 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {formatCamelCase(subKey)}:
                            </Typography>
                            <Box>{renderValue(subValue)}</Box>
                        </Box>
                    ))}
                </Box>
            );
        }
    }
    if(typeof value === "boolean") {
        return <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{value ? "Yes" : "No"}</Typography>;
    }
    return <Typography variant="body2" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{value || "N/A"}</Typography>;
};

const FHIRResourceCard = ({ resource , resourceId}) => {

    const handleExportAsQR = async () => {
        try {
          const user_id = localStorage.getItem("user_id");
          const objectName = `${user_id}_fhir_qr_${Date.now()}.json`;
          const bucketName = "mie_fhir_mobile_app_fhir_jsons";
    
          // Step 1: Get signed upload URL
          const { signedUrl } = await Meteor.callAsync("gcs.generateSignedUploadUrl", {
            userId: user_id,
            objectName,
            contentType: "application/json",
            bucketName,
          });
    
          // Step 2: Upload FHIR resource
          const uploadResponse = await fetch(signedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(resource),
          });
    
          if (!uploadResponse.ok) {
            throw new Error("FHIR upload failed");
          }
    
          // Step 3: Set QR Code URL
          const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectName}`;
          setQrUrl(publicUrl);
          setOpenDialog(true);
        } catch (error) {
          console.error("Error exporting FHIR data:", error);
          alert("Failed to export FHIR data.");
        }
      };


      const handleDelete = async () => {
        try {
          const confirm = window.confirm("Are you sure you want to delete this FHIR resource?");
          if (!confirm) return;
      
          const user_id = localStorage.getItem("user_id");
          const fhir_id = resourceId;

          console.log("Deleting resource with ID:", resourceId);
      
          if (!fhir_id) {
            alert("FHIR resource ID not found.");
            return;
          }
      
          const response = await Meteor.callAsync("resourceData.deleteByUserAndFhirId", {
            user_id,
            fhir_id,
          });
      
          if (response?.status === "success") {
            alert("Resource deleted successfully.");
            window.location.reload(); // Refresh to re-fetch cards
          } else {
            throw new Error(response?.message || "Deletion failed");
          }
        } catch (err) {
          console.error("Deletion error:", err);
          alert("Failed to delete the FHIR resource.");
        }
      };

    const [qrUrl, setQrUrl] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    if (!resource) return null;

    return (
        <Box sx={{ width: '100%' }}>
            <Card
                sx={{
                    margin: "auto",
                    boxShadow: 3,
                    borderRadius: 2,
                    textAlign: 'left',
                  }}
            >
                <CardContent>
                    {Object.entries(resource).map(([key, value]) => (
                        <Box key={key} sx={{ marginBottom: 1 }}>
                            <Typography variant="body1" fontWeight="bold" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {formatCamelCase(key)}:
                            </Typography>
                            {renderValue(value)}
                        </Box>
                    ))}
                    {resourceId && (
                        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                        <Button variant="outlined" onClick={handleExportAsQR} sx={{ fontWeight: 'bold' }}>
                            Export as QR
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDelete}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Delete
                        </Button>
                    </Box>
                    )}
                    
                </CardContent>
            </Card>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogContent sx={{ textAlign: "center"}}>
                    <Typography variant="h6" gutterBottom>Scan to Access FHIR Data</Typography>
                    {qrUrl && (
                    <>
                        <QRCodeSVG value={qrUrl} size={256} />

                        <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Or copy this link:
                        </Typography>

                        <Box
                            sx={{
                            backgroundColor: "#f0f0f0",
                            padding: "8px",
                            borderRadius: "4px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            wordBreak: "break-all",
                            mb: 1,
                            userSelect: "all",
                            }}
                        >
                            {qrUrl}
                        </Box>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                            navigator.clipboard.writeText(qrUrl).then(() => {
                                alert("Link copied to clipboard!");
                            }).catch(() => {
                                alert("Failed to copy link.");
                            });
                            }}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Copy to Clipboard
                        </Button>
                        </Box>
                    </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default FHIRResourceCard;
