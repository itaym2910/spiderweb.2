// src/NetworkVisualizerWrapper.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  const handleZoneClick = (zoneId) => {
    // Navigate to the CoreSitePage route for the specific zone
    // The path is relative to where <Routes> is defined in DashboardPage
    navigate(`zone/${zoneId}`);
  };

  return (
    <NetworkVisualizer
      data={data} // Pass data through, even if NetworkVisualizer uses its own constants
      theme={theme}
      onZoneClick={handleZoneClick} // Pass the click handler
    />
  );
};

export default NetworkVisualizerWrapper;
