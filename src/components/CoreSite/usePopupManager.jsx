// src/components/CoreSite/usePopupManager.js
import { useState, useEffect } from "react";

// Popup appearance and stacking constants
// REMOVED: const POPUP_MAX_HEIGHT_VH = 75;
const POPUP_WIDTH_PX = 520; // Width remains as previously set

const STACK_OFFSET_Y_PX = 20;
const STACK_OFFSET_X_PX = 0;
const MAX_DEPTH_FOR_OFFSET_STACKING = 3;

export function usePopupManager(popupAnchor) {
  const [openPopups, setOpenPopups] = useState([]);
  const [nextPopupInstanceId, setNextPopupInstanceId] = useState(0);
  const [activatedPopupIds, setActivatedPopupIds] = useState(new Set());

  useEffect(() => {
    if (activatedPopupIds.size > 0) {
      const timerId = setTimeout(() => {
        setOpenPopups((currentPopups) =>
          currentPopups.map((p) =>
            activatedPopupIds.has(p.instanceId) ? { ...p, isOpen: true } : p
          )
        );
        setActivatedPopupIds(new Set());
      }, 10);
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
        const updatedPopups = [...prevPopups];
        const existingInstanceId = updatedPopups[existingPopupIndex].instanceId;
        updatedPopups[existingPopupIndex] = {
          ...updatedPopups[existingPopupIndex],
          detailData: detailPayload,
          isOpen: false,
        };
        setActivatedPopupIds((prev) => new Set(prev).add(existingInstanceId));
        return updatedPopups;
      } else {
        const newInstanceId = nextPopupInstanceId;
        setActivatedPopupIds((prev) => new Set(prev).add(newInstanceId));
        setNextPopupInstanceId((prevId) => prevId + 1);
        return [
          ...prevPopups,
          {
            instanceId: newInstanceId,
            detailData: detailPayload,
            isOpen: false,
          },
        ];
      }
    });
  };

  const closePopup = (instanceIdToClose) => {
    setOpenPopups((prevPopups) =>
      prevPopups.map((p) =>
        p.instanceId === instanceIdToClose ? { ...p, isOpen: false } : p
      )
    );
    setActivatedPopupIds((prev) => {
      const next = new Set(prev);
      next.delete(instanceIdToClose);
      return next;
    });
    setTimeout(() => {
      setOpenPopups((prevPopups) =>
        prevPopups.filter((p) => p.instanceId !== instanceIdToClose)
      );
    }, 300);
  };

  // Updated to accept containerHeightPx
  const getPopupPositioning = (index, totalPopups, containerHeightPx = 0) => {
    const stackDepth = index;
    const stackDepthForOffset = Math.min(
      stackDepth,
      MAX_DEPTH_FOR_OFFSET_STACKING - 1
    );

    const baseTop = popupAnchor.top;
    const baseRight = popupAnchor.right;

    let topPos = baseTop + stackDepthForOffset * STACK_OFFSET_Y_PX;
    let rightPos = baseRight + stackDepthForOffset * STACK_OFFSET_X_PX;

    const currentZIndex = 100 + (totalPopups - 1 - stackDepth);
    const isVisiblyStacked = stackDepth < MAX_DEPTH_FOR_OFFSET_STACKING;

    if (!isVisiblyStacked) {
      topPos =
        baseTop + (MAX_DEPTH_FOR_OFFSET_STACKING - 1) * STACK_OFFSET_Y_PX;
      rightPos =
        baseRight + (MAX_DEPTH_FOR_OFFSET_STACKING - 1) * STACK_OFFSET_X_PX;
    }

    // Calculate max height based on 2/3 of container height
    // Ensure containerHeightPx is a positive number, otherwise use a fallback (e.g., 300px min height)
    const calculatedMaxHeight =
      containerHeightPx > 0 ? (containerHeightPx * 2) / 3 : 300;
    // You might want to ensure a minimum sensible height as well
    const finalMaxHeightPx = Math.max(200, calculatedMaxHeight); // Example: min 200px

    return {
      topPosition: topPos,
      popupRightOffsetPx: rightPos,
      zIndex: currentZIndex,
      isEffectivelyOpen: isVisiblyStacked,
      maxHeightPx: finalMaxHeightPx, // Changed from maxWidthVh
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
