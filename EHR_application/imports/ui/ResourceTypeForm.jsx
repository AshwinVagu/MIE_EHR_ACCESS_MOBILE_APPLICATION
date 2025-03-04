import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import Grid from '@mui/material/Grid2'; // Use Grid2 for better spacing
import { fhir_token_options } from "../metadata_jsons/fhir_token_options.js"; // Import JSON
import FHIRResourceCard from "./FHIRResourceCard"; // Import Card Component

export const ResourceTypeForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const resource = location.state?.resource;

    if (!resource) {
        return <Typography variant="h6">No resource data found.</Typography>;
    }

    const { type, searchParam = [] } = resource;
    const predefinedOptions = fhir_token_options[type] || [];
    const patient_info = JSON.parse(localStorage.getItem("webchart_token_results")) || {};

    const formatCamelCase = (text) => {
        return text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (str) => str.toUpperCase());
    };

    const getPrefilledValues = () => {
        let initialValues = {};
        let disabledFields = {};

        searchParam.forEach(param => {
            if (param.name === "patient" && type !== "Patient" && patient_info.patient) {
                initialValues[param.name] = patient_info.patient;
                disabledFields[param.name] = true;
            } 
            else if (param.name === "_id" && type === "Patient" && patient_info.patient) {
                initialValues["_id"] = patient_info.patient;
                disabledFields["_id"] = true;
            }
        });

        return { initialValues, disabledFields };
    };

    const { initialValues, disabledFields } = getPrefilledValues();
    const [formData, setFormData] = useState(initialValues);
    const [disabledFieldsState, setDisabledFieldsState] = useState(disabledFields);
    const [medicalData, setMedicalData] = useState([]); // Store retrieved data

    const handleChange = (event, paramName) => {
        setFormData(prev => ({
            ...prev,
            [paramName]: event.target.value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submitted Data:", formData);
        await fetchPatientMedicalData(patient_info.access_token, type, formData);
    };

    const fetchPatientMedicalData = async (access_token, resourceType, filters) => {
        try {
            const res = await Meteor.callAsync("ehrData.get", access_token, resourceType, filters);
            console.log("Patient Medical Data obtained:", res);

            let parsedData;
            if (res.resourceType === "Bundle" && res.entry) {
                parsedData = res.entry.map(entry => entry.resource); // Extract resources
            } else {
                parsedData = [res]; // Direct resource object
            }

            console.log("Parsed Data:", parsedData);

            setMedicalData(parsedData);
        } catch (err) {
            console.error("Error fetching medical data:", err);
        }
    };

    const addResourceData = async () => {
        if (!medicalData.length) {
            console.warn("No medical data to insert.");
            return;
        }
    
        const server_url = (patient_info.smart_style_url).replace("/.well-known/smart-style", "");
    
        // Prepare resources with unique FHIR keys
        const preparedResources = medicalData.map(resource => {
            const uniqueFHIRId = `FHIR-${server_url}-${resource.resourceType}-${resource.id}`;
            
            return {
                fhir_id: uniqueFHIRId,  
                user_id: "12345",  
                resource_data: resource,
                created_at: new Date(),
                updated_at: new Date()
            };
        }).filter(item => item !== null);
    
        console.log("Prepared Payload:", preparedResources);
    
        // Insert multiple resources at once
        try {
            const response = await Meteor.callAsync("resourceData.bulkInsert", preparedResources);
            if(response.status === "success") {
                if (window.plugins && window.plugins.toast) {
                    window.plugins.toast.showWithOptions(
                      {
                        message: "Data from your EHR provider has been successfully added to this application.",
                        duration: "short", // or 'long'
                        position: "bottom",
                      },
                      () => navigate("/ehr-data-retrieval"), // Success callback
                      (err) => console.error("Toast failed", err) // Error callback
                    );
                  } else {
                    console.error("Cordova toast plugin not available.");
                  }
                navigate("/ehr-data-retrieval");
            }
        } catch (error) {
            console.error("Error inserting resource data:", error);
        }
    };

    return (
        <Container style={{ marginTop: 20, maxWidth: "600px" }}>
            <Typography variant="h5" gutterBottom>
            {formatCamelCase(type)} - Give some details regarding the data you would like to access. At least one field is required. If a field is already prefilled with data, you can hit submit if you don't want any further filter options.
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} direction="column">
                    {searchParam.map((param, index) => {
                        const { name } = param;
                        const predefinedOption = predefinedOptions.find(option => option.name === name);

                        return (
                            <Grid xs={12} key={index}>
                                {param.type === "token" && predefinedOption ? (
                                    <FormControl fullWidth>
                                        <InputLabel>{name}</InputLabel>
                                        <Select
                                            value={formData[name] || ""}
                                            onChange={(e) => handleChange(e, name)}
                                            displayEmpty
                                            disabled={!!disabledFieldsState[name]}
                                        >
                                            {predefinedOption.possible_options.map((option, i) => (
                                                <MenuItem key={i} value={option}>
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : param.type === "date" ? (
                                    <TextField
                                        fullWidth
                                        label={name}
                                        type="date"
                                        slotProps={{ inputLabel: { shrink: true } }}
                                        value={formData[name] || ""}
                                        onChange={(e) => handleChange(e, name)}
                                        disabled={!!disabledFieldsState[name]}
                                    />
                                ) : (
                                    <TextField
                                        fullWidth
                                        label={name}
                                        type="text"
                                        value={formData[name] || ""}
                                        onChange={(e) => handleChange(e, name)}
                                        disabled={!!disabledFieldsState[name]}
                                    />
                                )}
                            </Grid>
                        );
                    })}
                </Grid>

                <Grid xs={12} sx={{ marginTop: 2 }}>
                    <Button variant="contained" color="primary" type="submit" fullWidth>
                        Submit
                    </Button>
                </Grid>
            </form>

            {/* Display FHIR Data Cards Below */}
            {medicalData.length > 0 && (
                <div>
                    <Typography variant="h5" gutterBottom sx={{ marginTop: 3 }}>
                        Retrieved {formatCamelCase(type)} Data:
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={addResourceData} fullWidth>
                        Add this EHR data to this application
                    </Button>
                </div>
            )}

            <Grid container spacing={2} sx={{ marginTop: 2, justifyContent: "center" }}>
                {medicalData.map((resource, index) => (
                    <FHIRResourceCard key={index} resource={resource} />
                ))}
            </Grid>


        </Container>
    );
};


