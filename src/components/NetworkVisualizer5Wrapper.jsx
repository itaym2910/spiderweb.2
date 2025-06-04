// src/components/NetworkVisualizer5Wrapper.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer5 from "./chart/NetworkVisualizer5";

const NetworkVisualizer5Wrapper = ({ data, theme }) => {
  // data prop might be for other purposes if NV5 uses its own constants
  const navigate = useNavigate();

  const handleZoneClick = (zoneId) => {
    navigate(`zone/${zoneId}`);
  };

  return (
    <NetworkVisualizer5
      data={data} // Pass data through
      theme={theme}
      onZoneClick={handleZoneClick} // Pass the click handler
    />
  );
};

export default NetworkVisualizer5Wrapper;
