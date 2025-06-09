// src/components/NetworkVisualizer5Wrapper.jsx
import React, { useCallback } from "react"; // Import useCallback
import { useNavigate } from "react-router-dom";
import NetworkVisualizer5 from "./chart/NetworkVisualizer5";

const NetworkVisualizer5Wrapper = ({ data, theme }) => {
  const navigate = useNavigate();

  // Stabilize handleZoneClick with useCallback
  const handleZoneClick = useCallback(
    (zoneId) => {
      navigate(`p-zone/${zoneId}`);
    },
    [navigate]
  ); // navigate is stable from useNavigate

  return (
    <NetworkVisualizer5
      data={data}
      theme={theme}
      onZoneClick={handleZoneClick}
    />
  );
};

export default NetworkVisualizer5Wrapper;
