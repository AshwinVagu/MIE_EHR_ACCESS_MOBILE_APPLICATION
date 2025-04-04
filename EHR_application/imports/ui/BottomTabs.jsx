import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import FaceIcon from '@mui/icons-material/Face';

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
        <BottomNavigationAction label="Overview" value="/home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Add Data" value="/ehr-data-retrieval" icon={<AccountCircleIcon />} />
        <BottomNavigationAction label="Smart Cards" value="/smart-card-reading" icon={<SettingsIcon />} />
        <BottomNavigationAction label="Profile" value="/profile" icon={<FaceIcon />} />
      </BottomNavigation>
    );
  };
  
  export default BottomTabs;