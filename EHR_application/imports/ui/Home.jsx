import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from "react-router-dom";
import { Overview } from './Overview.jsx';
import { EHRDataRetrieval } from './EHRDataRetrieval.jsx';
import { SmartCardReading } from './SmartCardReading.jsx'; 
import { EhrDataResourceTypes } from './EhrDataResourceTypes.jsx'; 
import { ResourceTypeForm } from './ResourceTypeForm.jsx';
import QRScanner from './QRScanner.jsx';
import BottomTabs from "./BottomTabs";
import { AuthCode } from './authCode.jsx';
import { SignUpPage } from './SignUpPage.jsx';
import { LoginPage } from './LoginPage.jsx';

const Home = () => {
  return (
    <Router>
        <div style={{ paddingBottom: "56px" }}> 
          <Routes>
            <Route path="/home" element={<Overview />} />
            <Route path="/ehr-data-retrieval" element={<EHRDataRetrieval />} />
            <Route path="/smart-card-reading" element={<SmartCardReading />} />
            <Route path="/qr-scanner" element={<QRScanner />} />
            <Route path="/code" element={<AuthCode />} />
            <Route path="/ehr-resource-types" element={<EhrDataResourceTypes />} />
            <Route path="/resource-type-form" element={<ResourceTypeForm />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/" element={<LoginPage />} /> 
          </Routes>
        </div>
        <BottomTabs />
    </Router>
  );
};

export default Home;