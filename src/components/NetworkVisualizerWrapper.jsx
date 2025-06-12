// src/NetworkVisualizerWrapper.jsx
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NetworkVisualizer from "./chart/NetworkVisualizer";
import { usePopupManager } from "./CoreSite/usePopupManager"; // <<< IMPORT
import SiteDetailPopup from "./CoreSite/SiteDetailPopup"; // <<< IMPORT

const NetworkVisualizerWrapper = ({ data, theme }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null); // Ref for the main container to anchor popups
  const [containerHeight, setContainerHeight] = useState(0);

  const popupAnchor = {
    // Define how popups are anchored
    top: 20, // Example: 20px from the top of wrapperRef
    right: 20, // Example: 20px from the right of wrapperRef
  };

  const { openPopups, addOrUpdatePopup, closePopup, getPopupPositioning } =
    usePopupManager(popupAnchor);

  useEffect(() => {
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
      navigate(`l-zone/${zoneId}`);
    },
    [navigate]
  );

  const handleLinkClick = useCallback(
    (linkDetailPayload) => {
      // Ensure the payload has a unique 'id' and 'type: "link"'
      // The payload created in setupInteractions should already have type: "link"
      // and an 'id' (which could be the link's original ID).
      addOrUpdatePopup(linkDetailPayload);
    },
    [addOrUpdatePopup]
  );

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      {" "}
      {/* Ensure this div takes up space */}
      <NetworkVisualizer
        data={data}
        theme={theme}
        onZoneClick={handleZoneClick}
        onLinkClick={handleLinkClick} // <<< PASS handleLinkClick
      />
      {/* Render Popups */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {" "}
        {/* Overlay for popups */}
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

export default NetworkVisualizerWrapper;
