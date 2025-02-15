import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { Overview } from './Overview.jsx';
import { EHRDataRetrieval } from './EHRDataRetrieval.jsx';
import { SmartCardReading } from './SmartCardReading.jsx'; 
import QRScanner from './QRScanner.jsx';
import BottomTabs from "./BottomTabs";

const Home = () => {
  return (
    <Router>
        <div style={{ paddingBottom: "56px" }}> 
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/ehr-data-retrieval" element={<EHRDataRetrieval />} />
            <Route path="/smart-card-reading" element={<SmartCardReading />} />
            <Route path="/qr-scanner" element={<QRScanner />} />
          </Routes>
        </div>
        <BottomTabs />
    </Router>
  );
};

export default Home;