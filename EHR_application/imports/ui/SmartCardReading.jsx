import React, { useState } from 'react';
import PatientSmartCard from "./PatientSmartCard";

export const SmartCardReading = () => {

  const patientData = {
    name: "John Doe",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    conditions: [
      {
        diagnosis: "Hypertension",
        symptoms: ["Headache", "Dizziness", "Shortness of breath"],
        medications: ["Lisinopril", "Aspirin"],
        notes: "Monitor blood pressure daily.",
        lastVisit: "2025-02-10T10:30:00Z",
      },
      {
        diagnosis: "Diabetes Type 2",
        symptoms: ["Frequent urination", "Increased thirst", "Fatigue"],
        medications: ["Metformin", "Insulin"],
        notes: "Maintain a healthy diet and exercise regularly.",
        lastVisit: "2025-01-15T14:00:00Z",
      },
      {
        diagnosis: "Asthma",
        symptoms: ["Wheezing", "Shortness of breath", "Chest tightness"],
        medications: ["Albuterol", "Fluticasone"],
        notes: "Avoid exposure to dust and cold air.",
        lastVisit: "2024-12-20T09:45:00Z",
      },
    ],
  };

  return (
    <div>
     <PatientSmartCard patient={patientData} />
    </div>
  );
};