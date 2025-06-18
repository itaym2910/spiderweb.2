// src/NetworkVisualizer5Wrapper.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer5 from "./chart/NetworkVisualizer5";
import { usePopupManager } from "./CoreSite/usePopupManager";
import SiteDetailPopup from "./CoreSite/SiteDetailPopup";

const NetworkVisualizer5Wrapper = ({ data, theme }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const popupAnchor = { top: 20, right: 20 };
  const { openPopups, addOrUpdatePopup, closePopup, getPopupPositioning } =
    usePopupManager(popupAnchor);

  useEffect(() => {
    // ... (ResizeObserver logic remains the same)
    if (wrapperRef.current) {
      setContainerHeight(wrapperRef.current.offsetHeight);
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(wrapperRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const handleZoneClick = useCallback(
    (zoneId) => {
      // Navigate relative to the current base path (e.g., /p-chart)
      navigate(`zone/${zoneId}`);
    },
    [navigate]
  );

  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      addOrUpdatePopup(linkDetailPayload);
    },
    [addOrUpdatePopup]
  );

  const handleNodeClick = useCallback(
    (nodeData) => {
      if (nodeData && nodeData.id && nodeData.zone) {
        // Navigate relative to the current base path
        navigate(`zone/${nodeData.zone}/node/${nodeData.id}`);
      } else {
        console.warn("Node data incomplete for navigation:", nodeData);
      }
    },
    [navigate]
  );

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <NetworkVisualizer5
        data={data}
        theme={theme}
        onZoneClick={handleZoneClick}
        onLinkClick={handleLinkClick}
        onNodeClick={handleNodeClick}
      />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {openPopups.map((popup, index) => {
          const positioning = getPopupPositioning(
            index,
            openPopups.length,
            containerHeight
          );
          return (
            <SiteDetailPopup
              key={popup.instanceId}
              isOpen={popup.isOpen}
              onClose={() => closePopup(popup.instanceId)}
              detailData={popup.detailData}
              topPosition={positioning.topPosition}
              popupRightOffsetPx={positioning.popupRightOffsetPx}
              zIndex={positioning.zIndex}
              maxHeightPx={positioning.maxHeightPx}
              popupWidthPx={positioning.popupWidthPx}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NetworkVisualizer5Wrapper;
