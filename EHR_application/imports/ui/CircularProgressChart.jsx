import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

export const CircularProgressChart = ({ value = 50, unit = "%" }) => {
  const percentage = Math.min(value, 100); // Ensure value does not exceed 100%

  // Color logic based on value thresholds
  const getColor = (value) => {
    if (value < 50) return "#EF5350"; // Red (low)
    if (value < 75) return "#FFCA28"; // Yellow (medium)
    return "#66BB6A"; // Green (high)
  };

  const chartData = {
    datasets: [
      {
        data: [percentage, 100 - percentage], // Filled vs. Empty space
        backgroundColor: [getColor(percentage), "#E0E0E0"], // Grey for the remaining part
        borderWidth: 0, // Remove borders for a clean look
        cutout: "75%", // Adjust thickness to look like a circular progress bar
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw}${unit}`,
        },
      },
    },
  };

  return (
    <div style={{ width: "200px", height: "200px", position: "relative", textAlign: "center" }}>
      <Doughnut data={chartData} options={chartOptions} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "22px",
          fontWeight: "bold",
          color: getColor(percentage),
        }}
      >
        {percentage}{unit}
      </div>
    </div>
  );
};
