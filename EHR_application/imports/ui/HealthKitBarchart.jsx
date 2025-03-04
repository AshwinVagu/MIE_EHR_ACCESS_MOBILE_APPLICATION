import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables); // Register Chart.js modules

const processChartData = (rawData) => {
    // Aggregate `quantity` by date
    const aggregatedData = rawData.reduce((acc, entry) => {
      const date = entry.startDate.split("T")[0]; // Extract YYYY-MM-DD from ISO timestamp
      acc[date] = (acc[date] || 0) + entry.quantity; // Sum up the quantity
      return acc;
    }, {});
  
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
  
    // Convert object to sorted array & filter last 7 days
    const sortedDates = Object.keys(aggregatedData)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-7);
  
    const finalQuantities = sortedDates.map((date) => aggregatedData[date]);
  
    // ✅ FIX: Force Local Time for Correct Weekday Labels
    const formattedLabels = sortedDates.map((date) => {
      const dateObj = new Date(date + "T00:00:00"); // Ensure local time interpretation
      return date === today
        ? "Today"
        : dateObj.toLocaleDateString("en-US", { weekday: "short" }); // "Sun", "Mon", etc.
    });
  
    return { labels: formattedLabels, data: finalQuantities, rawLabels: sortedDates };
  };

export const HealthKitBarchart = ({ rawData, unit = "" }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [rawLabels, setRawLabels] = useState([]); // Stores full dates for tooltips

  useEffect(() => {
    if (rawData.length > 0) {
      const { labels, data, rawLabels } = processChartData(rawData);

      setChartData({
        labels,
        datasets: [
          {
            label: `Total Quantity (${unit})`,
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)", // Modern green-blue
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            borderRadius: 8, // Rounded bars for modern look
          },
        ],
      });

      setRawLabels(rawLabels); // Store full dates for tooltips
    }
  }, [rawData, unit]);

  return (
    <div style={{ width: "100%", height: "300px", padding: "10px" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }, // Hide legend for cleaner UI
            tooltip: {
              callbacks: {
                title: (tooltipItems) => rawLabels[tooltipItems[0].dataIndex], // Show full date in tooltip
              },
            },
          },
          scales: {
            x: {
              grid: { display: false }, // Remove grid lines
              ticks: { color: "#333", font: { size: 14, weight: "bold" } },
            },
            y: {
              beginAtZero: true,
              grid: { display: false }, // Remove grid lines
              ticks: { color: "#333", font: { size: 14, weight: "bold" } },
            },
          },
        }}
      />
    </div>
  );
};
