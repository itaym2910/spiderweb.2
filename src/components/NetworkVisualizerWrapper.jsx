// src/NetworkVisualizerWrapper.jsx
import React, { useCallback } from "react"; // Import useCallback
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  // Stabilize handleZoneClick with useCallback
  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`l-zone/${zoneId}`);
    },
    [navigate]
  ); // navigate is stable

  return (
    <NetworkVisualizer
      data={data}
      theme={theme}
      onZoneClick={handleZoneClick}
    />
  );
};

export default NetworkVisualizerWrapper;
