// src/useDashboardLogic.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useDashboardLogic({ isAppFullscreen, isSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to determine active tab based on current path
  const getTabFromPath = (pathname) => {
    if (pathname.startsWith("/site/")) {
      return "site";
    }
    if (pathname.includes("/l-zone/")) {
      return "l_network";
    }
    if (pathname.includes("/p-zone/")) {
      return "p_network";
    }
    // Add more conditions if other tabs have distinct URL patterns
    // Default to 'table' if no other pattern matches or if at a base path
    return "table";
  };

  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  // Initialize activeTabValue based on the current path
  const [activeTabValue, setActiveTabValue] = useState(() =>
    getTabFromPath(location.pathname)
  );

  const tabContentCardRef = useRef(null);
  const [popupAnchorCoords, setPopupAnchorCoords] = useState({
    top: 20,
    right: 20,
  });

  // Theme mutation observer (remains the same)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Popup anchor coordinates update (remains the same)
  useEffect(() => {
    const updateAnchor = () => {
      if (tabContentCardRef.current) {
        const rect = tabContentCardRef.current.getBoundingClientRect();
        setPopupAnchorCoords({
          top: rect.top,
          right: window.innerWidth - rect.right,
        });
      } else {
        const appHeader = document.querySelector("header");
        const mainPadding = 24;
        setPopupAnchorCoords({
          top:
            (appHeader ? appHeader.getBoundingClientRect().bottom : 0) +
            mainPadding,
          right: mainPadding,
        });
      }
    };
    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    return () => {
      window.removeEventListener("resize", updateAnchor);
    };
  }, [activeTabValue, isAppFullscreen, isSidebarCollapsed]);

  // Sync activeTabValue with URL changes (This is the critical part)
  useEffect(() => {
    const newTabBasedOnUrl = getTabFromPath(location.pathname);
    if (newTabBasedOnUrl !== activeTabValue) {
      // console.log(`Path changed to: ${location.pathname}, switching tab from ${activeTabValue} to ${newTabBasedOnUrl}`);
      setActiveTabValue(newTabBasedOnUrl);
    }
  }, [activeTabValue, location.pathname]); // Only re-run when the pathname changes

  const handleTabChangeForNavigation = (newClickedTabValue) => {
    const currentPath = location.pathname;
    const targetTabForCurrentPath = getTabFromPath(currentPath);

    // If the user clicks a tab that is different from the one implied by the current URL's detail view,
    // navigate to a base path.
    if (
      targetTabForCurrentPath !== newClickedTabValue &&
      (currentPath.includes("/l-zone/") ||
        currentPath.includes("/p-zone/") ||
        currentPath.startsWith("/site/"))
    ) {
      // Navigating away from a detail view of one tab type by clicking a different tab.
      // Go to the base of the application or the base of the new tab if it has one.
      // For now, let's assume navigating to "/" clears any detail view.
      // console.log(`Clearing detail view. Current: ${currentPath}, Target Tab: ${newClickedTabValue}`);
      navigate("/"); // Or a more specific base path for the newClickedTabValue if applicable
    } else {
      // If clicking the same tab that the current detail view belongs to, or a base tab,
      // or if the new tab doesn't have a specific base path different from "/",
      // no navigation is needed here, just set the active tab.
      // console.log(`No navigation needed, just setting active tab to: ${newClickedTabValue}`);
    }

    // Always update the activeTabValue to the one that was clicked.
    // The useEffect above will catch any discrepancies if this navigation itself
    // lands on a path that implies a different tab (though less likely with this logic).
    if (activeTabValue !== newClickedTabValue) {
      setActiveTabValue(newClickedTabValue);
    }
  };

  const chartKeySuffix = `${isAppFullscreen}-${isSidebarCollapsed}`;

  return {
    theme,
    activeTabValue,
    // setActiveTabValue, // Not typically needed to expose if logic is self-contained
    tabContentCardRef,
    popupAnchorCoords,
    handleTabChangeForNavigation,
    chartKeySuffix,
  };
}
