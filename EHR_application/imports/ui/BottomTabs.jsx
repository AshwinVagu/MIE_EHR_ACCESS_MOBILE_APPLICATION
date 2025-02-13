import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";

const BottomTabs = () => {
    const location = useLocation();
    const navigate = useNavigate();
  
    return (
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
        sx={{ position: "fixed", bottom: 0, width: "100%", backgroundColor: "#fff", borderTop: "1px solid #ddd" }}
      >
        <BottomNavigationAction label="Overview" value="/" icon={<HomeIcon />} />
        <BottomNavigationAction label="EHRDataRetrieval" value="/ehr-data-retrieval" icon={<AccountCircleIcon />} />
        <BottomNavigationAction label="SmartCardReading" value="/smart-card-reading" icon={<SettingsIcon />} />
      </BottomNavigation>
    );
  };
  
  export default BottomTabs;