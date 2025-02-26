import React from "react";
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText } from "@mui/material";
import Grid from "@mui/material/Grid2";

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
                            <Typography variant="body2" fontWeight="bold">
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
        return <Typography variant="body2">{value ? "Yes" : "No"}</Typography>;
    }
    return <Typography variant="body2">{value || "N/A"}</Typography>;
};

const FHIRResourceCard = ({ resource }) => {
    if (!resource) return null;

    return (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <Card
                sx={{
                    width: "600px", 
                    maxWidth: "100%", 
                    border: "2px solid #1976d2",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", 
                    cursor: "pointer",
                    transition: "0.3s",
                    margin: "auto", 
                    padding: 2,
                }}
            >
                <CardContent>
                    {Object.entries(resource).map(([key, value]) => (
                        <Box key={key} sx={{ marginBottom: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                                {formatCamelCase(key)}:
                            </Typography>
                            {renderValue(value)}
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default FHIRResourceCard;
