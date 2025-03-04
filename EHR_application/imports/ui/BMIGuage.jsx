import React from "react";
import GaugeChart from "react-gauge-chart";

export const BMIGauge = ({ bmi }) => {
  const normalizedBMI = (bmi - 10) / 30; // Normalize BMI to fit gauge range (10-40)
  
  // Calculate difference from the ideal BMI range
  let difference = 0;
  let message = "You're in the healthy range!";
  if (bmi < 18.5) {
    difference = (18.5 - bmi).toFixed(1);
    message = `You are ${difference} BMI points underweight.`;
  } else if (bmi > 24.9) {
    difference = (bmi - 24.9).toFixed(1);
    message = `You are ${difference} BMI points above the ideal range.`;
  }

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <GaugeChart
        id="bmi-gauge"
        nrOfLevels={4}
        colors={["#42A5F5", "#66BB6A", "#FFCA28", "#EF5350"]} // Blue, Green, Yellow, Red
        percent={normalizedBMI}
        formatTextValue={() => `BMI: ${bmi.toFixed(1)}`}
      />
      <p style={{ fontSize: "16px", marginTop: "10px", fontWeight: "bold", color: bmi < 18.5 || bmi > 24.9 ? "#E53935" : "#43A047" }}>
        {message}
      </p>
    </div>
  );
};
