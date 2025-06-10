// src/components/CoreSite/usePopupManager.js
import { useState, useEffect } from "react";

// Popup appearance and stacking constants
const POPUP_MAX_HEIGHT_VH = 48;
const POPUP_WIDTH_PX = 384;
const STACK_OFFSET_Y_PX = 20;
const STACK_OFFSET_X_PX = 0; // For horizontal stacking if ever needed
const MAX_DEPTH_FOR_OFFSET_STACKING = 3;

export function usePopupManager(popupAnchor) {
  const [openPopups, setOpenPopups] = useState([]);
  const [nextPopupInstanceId, setNextPopupInstanceId] = useState(0);
  const [activatedPopupIds, setActivatedPopupIds] = useState(new Set());

  // Effect for two-step animation (set isOpen to true after a brief delay)
  useEffect(() => {
    if (activatedPopupIds.size > 0) {
      const timerId = setTimeout(() => {
        setOpenPopups((currentPopups) =>
          currentPopups.map((p) =>
            activatedPopupIds.has(p.instanceId) ? { ...p, isOpen: true } : p
          )
        );
        setActivatedPopupIds(new Set()); // Clear activated IDs after processing
      }, 10); // Small delay for the CSS transition to pick up
      return () => clearTimeout(timerId);
    }
  }, [activatedPopupIds]);

  const addOrUpdatePopup = (detailPayload) => {
    setOpenPopups((prevPopups) => {
      const existingPopupIndex = prevPopups.findIndex(
        (p) =>
          p.detailData &&
          p.detailData.id === detailPayload.id &&
          p.detailData.type === detailPayload.type
      );

      if (existingPopupIndex > -1) {
        // Popup exists, update its data and mark for re-activation (if closed)
        const updatedPopups = [...prevPopups];
        const existingInstanceId = updatedPopups[existingPopupIndex].instanceId;
        updatedPopups[existingPopupIndex] = {
          ...updatedPopups[existingPopupIndex],
          detailData: detailPayload,
          isOpen: false, // Set to false to re-trigger animation
        };
        setActivatedPopupIds((prev) => new Set(prev).add(existingInstanceId));
        return updatedPopups;
      } else {
        // Popup doesn't exist, add a new one
        const newInstanceId = nextPopupInstanceId;
        setActivatedPopupIds((prev) => new Set(prev).add(newInstanceId));
        setNextPopupInstanceId((prevId) => prevId + 1);
        return [
          ...prevPopups,
          {
            instanceId: newInstanceId,
            detailData: detailPayload,
            isOpen: false, // For two-step animation
          },
        ];
      }
    });
  };

  const closePopup = (instanceIdToClose) => {
    // Step 1: Trigger close animation
    setOpenPopups((prevPopups) =>
      prevPopups.map((p) =>
        p.instanceId === instanceIdToClose ? { ...p, isOpen: false } : p
      )
    );
    // Ensure it's not in the activation queue if closed quickly
    setActivatedPopupIds((prev) => {
      const next = new Set(prev);
      next.delete(instanceIdToClose);
      return next;
    });
    // Step 2: Remove from DOM after animation
    setTimeout(() => {
      setOpenPopups((prevPopups) =>
        prevPopups.filter((p) => p.instanceId !== instanceIdToClose)
      );
    }, 300); // Match CSS transition duration
  };

  const getPopupPositioning = (index, totalPopups) => {
    const stackDepth = index;
    const stackDepthForOffset = Math.min(
      stackDepth,
      MAX_DEPTH_FOR_OFFSET_STACKING - 1
    );

    const baseTop = popupAnchor.top;
    const baseRight = popupAnchor.right;

    let topPos = baseTop + stackDepthForOffset * STACK_OFFSET_Y_PX;
    let rightPos = baseRight + stackDepthForOffset * STACK_OFFSET_X_PX;

    const currentZIndex = 100 + (totalPopups - 1 - stackDepth); // Ensure top is highest
    const isVisiblyStacked = stackDepth < MAX_DEPTH_FOR_OFFSET_STACKING;

    if (!isVisiblyStacked) {
      // Position popups beyond visible stack at the last visible position
      topPos =
        baseTop + (MAX_DEPTH_FOR_OFFSET_STACKING - 1) * STACK_OFFSET_Y_PX;
      rightPos =
        baseRight + (MAX_DEPTH_FOR_OFFSET_STACKING - 1) * STACK_OFFSET_X_PX;
    }

    return {
      topPosition: topPos,
      popupRightOffsetPx: rightPos,
      zIndex: currentZIndex,
      // isEffectivelyOpen determines if it should be visually rendered as open
      // based on stacking, even if its own isOpen state is true.
      isEffectivelyOpen: isVisiblyStacked,
      maxWidthVh: POPUP_MAX_HEIGHT_VH,
      popupWidthPx: POPUP_WIDTH_PX,
    };
  };

  return {
    openPopups,
    addOrUpdatePopup,
    closePopup,
    getPopupPositioning,
  };
}
