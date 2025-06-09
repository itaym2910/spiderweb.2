// src/context/AppLayoutContext.js
import React, { createContext, useState, useContext } from "react";

const AppLayoutContext = createContext();

export const useAppLayout = () => useContext(AppLayoutContext);

export const AppLayoutProvider = ({ children }) => {
  const [isSitePopupActive, setIsSitePopupActive] = useState(false);

  // Define popup dimensions here or import them if they are in a shared constants file
  // These must match the actual width and intended final offset for the fullscreen button
  const SITE_POPUP_WIDTH_PX = 384; // From CoreSitePage (md:w-96)
  const SITE_POPUP_SCREEN_EDGE_OFFSET_PX = 20; // From CoreSitePage (popupRightOffsetPx)
  const FULLSCREEN_BUTTON_DESIRED_GAP_PX = 16; // e.g., 1rem, space between popup and button

  const fullscreenButtonRightOffset = isSitePopupActive
    ? SITE_POPUP_SCREEN_EDGE_OFFSET_PX +
      SITE_POPUP_WIDTH_PX +
      FULLSCREEN_BUTTON_DESIRED_GAP_PX
    : 16; // Default: 'right-4' which is 1rem or 16px

  const value = {
    isSitePopupActive,
    setIsSitePopupActive,
    fullscreenButtonRightOffset, // Calculated offset for the button
    // We can also pass the raw constants if App.js needs to do more complex calcs
    // SITE_POPUP_WIDTH_PX,
    // SITE_POPUP_SCREEN_EDGE_OFFSET_PX
  };

  return (
    <AppLayoutContext.Provider value={value}>
      {children}
    </AppLayoutContext.Provider>
  );
};
