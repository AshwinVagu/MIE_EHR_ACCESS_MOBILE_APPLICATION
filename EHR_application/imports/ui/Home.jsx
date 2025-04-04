import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
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
import { ProfilePage } from './ProfilePage.jsx';
import ProtectedRoute from "../utils/ProtectedRoute"; 

const AppRoutes = () => {
  const location = useLocation();
  const hideBottomTabs = location.pathname === '/' || location.pathname === '/signup';

  return (
    <>
      <div style={{ paddingBottom: hideBottomTabs ? 0 : "56px" }}>
        <Routes>

          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute><Overview /></ProtectedRoute>
          } />
          <Route path="/ehr-data-retrieval" element={
            <ProtectedRoute><EHRDataRetrieval /></ProtectedRoute>
          } />
          <Route path="/smart-card-reading" element={
            <ProtectedRoute><SmartCardReading /></ProtectedRoute>
          } />
          <Route path="/qr-scanner" element={
            <ProtectedRoute><QRScanner /></ProtectedRoute>
          } />
          <Route path="/code" element={
            <ProtectedRoute><AuthCode /></ProtectedRoute>
          } />
          <Route path="/ehr-resource-types" element={
            <ProtectedRoute><EhrDataResourceTypes /></ProtectedRoute>
          } />
          <Route path="/resource-type-form" element={
            <ProtectedRoute><ResourceTypeForm /></ProtectedRoute>
          } />

          {/* <Route path="/profile" element={<ProfilePage />} /> 
          <Route path="/home" element={<Overview />} />
          <Route path="/ehr-data-retrieval" element={<EHRDataRetrieval />} />
          <Route path="/smart-card-reading" element={<SmartCardReading />} />
          <Route path="/qr-scanner" element={<QRScanner />} />
          <Route path="/code" element={<AuthCode />} />
          <Route path="/ehr-resource-types" element={<EhrDataResourceTypes />} />
          <Route path="/resource-type-form" element={<ResourceTypeForm />} /> */}


          
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<LoginPage />} /> 
        </Routes>
      </div>
      {!hideBottomTabs && <BottomTabs />}
    </>
  );
};

const Home = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default Home;
