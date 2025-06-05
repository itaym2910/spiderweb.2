// src/NetworkVisualizerWrapper.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  const handleZoneClick = (zoneId) => {
    navigate(`l-zone/${zoneId}`); // Use the new prefixed path
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
