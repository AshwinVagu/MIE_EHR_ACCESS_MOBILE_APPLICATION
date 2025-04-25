import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FaceIcon from '@mui/icons-material/Face';
import AddCardIcon from '@mui/icons-material/AddCard';
import DataUsageIcon from '@mui/icons-material/DataUsage';

const BottomTabs = () => {
    const location = useLocation();
    const navigate = useNavigate();
  
    return (
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100vw',              // Full viewport width
          maxWidth: '100vw',           // Prevent container constraints
          backgroundColor: '#fff',
          borderTop: '1px solid #ddd',
          padding: 0,                  // Remove any inherited padding
          margin: 0,
          zIndex: 1300  
         }}
      >
        <BottomNavigationAction label="Dashboard" value="/home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Add Data" value="/ehr-data-retrieval" icon={<DataUsageIcon />} />
        <BottomNavigationAction label="Smart Cards" value="/smart-card-reading" icon={<AddCardIcon />} />
        <BottomNavigationAction label="Profile" value="/profile" icon={<FaceIcon />} />
      </BottomNavigation>
    );
  };
  
  export default BottomTabs;