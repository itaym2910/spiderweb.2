// src/useDashboardLogic.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useDashboardLogic({ isAppFullscreen, isSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getBasePathForTab = (tabValue) => {
    switch (tabValue) {
      case "table":
        return "/mainlines";
      case "l_network":
        return "/l-chart";
      case "p_network":
        return "/p-chart";
      case "site":
        return "/sites";
      default:
        return "/mainlines";
    }
  };

  const getTabFromPath = (pathname) => {
    if (pathname.startsWith("/sites")) return "site";
    if (pathname.startsWith("/l-chart")) return "l_network";
    if (pathname.startsWith("/p-chart")) return "p_network";
    if (pathname === "/mainlines") return "table";
    // Default for "/" (before redirect) or any other unhandled path
    return "table";
  };

  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  // Initialize activeTabValue directly from the current URL path.
  // The useEffect below will keep it in sync.
  const [activeTabValue, setActiveTabValue] = useState(() => {
    return getTabFromPath(location.pathname);
  });

  const tabContentCardRef = useRef(null); // Still potentially useful for popupAnchor
  const [popupAnchorCoords, setPopupAnchorCoords] = useState({
    top: 20,
    right: 20,
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateAnchor = () => {
      // Logic for popupAnchorCoords remains the same
      // It might need adjustment if tabContentCardRef is no longer reliable due to Cards being in Routes
      // For now, assuming the fallback or existing logic is acceptable.
      if (
        tabContentCardRef.current &&
        activeTabValue !== "l_network" &&
        activeTabValue !== "p_network" &&
        activeTabValue !== "site"
      ) {
        // Example condition if ref is specific
        const rect = tabContentCardRef.current.getBoundingClientRect();
        setPopupAnchorCoords({
          top: rect.top,
          right: window.innerWidth - rect.right,
        });
      } else {
        // Fallback for charts or if ref is not specific to current view
        const appHeader = document.querySelector("header"); // This might be null in fullscreen
        const mainPadding = isAppFullscreen ? 0 : 24;
        let topOffset = mainPadding;
        if (appHeader) {
          topOffset = appHeader.getBoundingClientRect().bottom + mainPadding;
        } else if (!isAppFullscreen) {
          // If no header but not fullscreen, assume some top padding
          topOffset = 20; // Default dashboard padding
        } else {
          topOffset = 20; // Default for fullscreen charts
        }
        setPopupAnchorCoords({
          top: topOffset,
          right: mainPadding + 20, // Add some offset from edge
        });
      }
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    return () => window.removeEventListener("resize", updateAnchor);
  }, [activeTabValue, isAppFullscreen, isSidebarCollapsed]); // Re-calculate if these change

  // Sync activeTabValue WITH URL changes. This is the primary mechanism.
  useEffect(() => {
    const newTabBasedOnUrl = getTabFromPath(location.pathname);
    if (newTabBasedOnUrl !== activeTabValue) {
      setActiveTabValue(newTabBasedOnUrl);
    }
  }, [activeTabValue, location.pathname]); // IMPORTANT: Only location.pathname. activeTabValue derived from it.

  const handleTabChangeForNavigation = (newClickedTabValue) => {
    const targetPath = getBasePathForTab(newClickedTabValue);

    // Only navigate. The useEffect above will sync activeTabValue from the URL.
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    } else {
      // If already on the target path, but the tab click was for the same logical tab,
      // ensure activeTabValue is correctly set (e.g., if initial state was slightly off).
      // This is a defensive measure.
      if (activeTabValue !== newClickedTabValue) {
        setActiveTabValue(newClickedTabValue);
      }
    }
  };

  const chartKeySuffix = `${isAppFullscreen}-${isSidebarCollapsed}`;

  return {
    theme,
    activeTabValue,
    tabContentCardRef, // Pass it, DashboardPage might assign it to the correct Card conditionally
    popupAnchorCoords,
    handleTabChangeForNavigation,
    chartKeySuffix,
  };
}
