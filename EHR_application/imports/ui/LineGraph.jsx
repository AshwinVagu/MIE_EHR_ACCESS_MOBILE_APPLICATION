import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export const LineGraph = ({ dataPoints = [], unit = "" }) => {
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    return <p style={{ textAlign: "center", fontSize: "16px", color: "#666" }}>No data available</p>;
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Sort data by startDate
  const sortedData = [...dataPoints].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  // Extract labels (formatted days) and values (quantities)
  const labels = sortedData.map(({ startDate }) => {
    const dateObj = new Date(startDate); // Ensure it's a valid date

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"; // Fallback if parsing fails
    }

    const dateStr = dateObj.toISOString().split("T")[0]; // Extract YYYY-MM-DD

    return dateStr === today
      ? "Today"
      : dateObj.toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue", etc.
  });

  const values = sortedData.map(({ quantity }) => quantity);
  const fullDates = sortedData.map(({ startDate }) => new Date(startDate).toLocaleString()); // Full date for tooltip

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.2)",
        tension: 0.4, // Smooth curve
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => fullDates[tooltipItems[0].dataIndex], // Show full date in tooltip
          label: (tooltipItem) => `${tooltipItem.raw}${unit}`,
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: "#333" },
      },
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { color: "#333" },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};
