import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useNavigate, useLocation } from "react-router-dom";

export const EhrDataResourceTypes = () => {
    const [resourceTypes, setResourceTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 

    useEffect(() => {
        let token = localStorage.getItem("webchart_access_token");
        if (token) {
            fetchMedicalMetaData(token);
        }
    }, []);

    const fetchMedicalMetaData = async (access_token) => {
        try {
            const res = await Meteor.callAsync("ehrData.getMetadata", access_token);
            console.log("Data obtained:", res);
            
            if (res && res.rest && Array.isArray(res.rest)) {
                const resources = res.rest.flatMap(r => r.resource || []); // Store full resource objects
                setResourceTypes(resources);
            } else {
                console.warn("Invalid FHIR CapabilityStatement response");
            }
        } catch (err) {
            console.error("Error fetching medical data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to format camelCase and PascalCase to normal words
    const formatResourceType = (text) => {
        return text.replace(/([a-z])([A-Z])/g, '$1 $2'); // Adds space between lowercase-uppercase transitions
    };

    // Handle Card Click
    const handleCardClick = (resource) => {
        navigate("/resource-type-form", { state: { resource } });
    };

    return (
        <Container style={{ marginTop: 20, maxWidth: "600px" }}> {/* Adjust width for better mobile UX */}
            <Typography variant="h5" gutterBottom>
                What type of Medical Data would you like to access?
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : (
                <Grid container spacing={2} direction="column"> {/* Stack cards vertically */}
                    {resourceTypes.map((resource, index) => (
                        <Grid item xs={12} key={index}>
                            <Card
                                sx={{
                                    width: "100%", // Make the cards full width
                                    border: "2px solid #1976d2", // Blue border for emphasis
                                    borderRadius: "8px",
                                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", // Soft shadow
                                    cursor: "pointer",
                                    transition: "0.3s",
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                        transform: "scale(1.02)", // Slight scale effect on hover
                                    },
                                }}
                                onClick={() => handleCardClick(resource)}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                        {formatResourceType(resource.type)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};
