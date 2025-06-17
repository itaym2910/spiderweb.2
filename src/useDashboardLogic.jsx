// src/useDashboardLogic.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useDashboardLogic({ isAppFullscreen, isSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getBasePathForTab = (tabValue) => {
    switch (tabValue) {
      case "table":
        return "/";
      case "l_network":
        return "/"; // Base L-chart is at /, shown when tab is active
      case "p_network":
        return "/"; // Base P-chart is at /, shown when tab is active
      case "site":
        return "/site"; // Base Site is at /site path
      default:
        return "/";
    }
  };

  const getTabFromPath = (pathname) => {
    // console.log(`DEBUG: getTabFromPath called with: ${pathname}`);
    if (pathname.startsWith("/site/") && pathname !== "/site") {
      // Detail: /site/foo
      // console.log("DEBUG: getTabFromPath -> site (detail)");
      return "site";
    }
    if (pathname === "/site") {
      // Base: /site
      // console.log("DEBUG: getTabFromPath -> site (base)");
      return "site";
    }
    if (pathname.includes("/l-zone/")) {
      // Detail: /l-zone/foo
      // console.log("DEBUG: getTabFromPath -> l_network (detail)");
      return "l_network";
    }
    if (pathname.includes("/p-zone/")) {
      // Detail: /p-zone/foo
      // console.log("DEBUG: getTabFromPath -> p_network (detail)");
      return "p_network";
    }
    // If path is "/" or any other unhandled path, it defaults to "table".
    // This means L-chart and P-chart base views (at "/") rely on activeTabValue.
    // console.log("DEBUG: getTabFromPath -> table (default or root)");
    return "table";
  };

  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const [activeTabValue, setActiveTabValue] = useState(() => {
    const initialTab = getTabFromPath(location.pathname);
    // console.log(`DEBUG: Initial activeTabValue set to: ${initialTab} from path: ${location.pathname}`);
    return initialTab;
  });

  const tabContentCardRef = useRef(null);
  const [popupAnchorCoords, setPopupAnchorCoords] = useState({
    top: 20,
    right: 20,
  });

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

  // Sync activeTabValue WITH URL changes.
  // This effect runs ONLY when location.pathname changes.
  useEffect(() => {
    const newTabBasedOnUrl = getTabFromPath(location.pathname);
    // console.log(`DEBUG: URL SYNC EFFECT START - Path: ${location.pathname}, TabFromURL: ${newTabBasedOnUrl}, CurrentActiveTab: ${activeTabValue}`);

    if (newTabBasedOnUrl !== activeTabValue) {
      // This condition is crucial: if the URL is "/", which getTabFromPath maps to "table",
      // but the user *intended* to be on "l_network" or "p_network" (whose base views are also at "/"),
      // we should NOT override their intent based on getTabFromPath's default for "/".
      if (
        location.pathname === "/" &&
        newTabBasedOnUrl === "table" &&
        (activeTabValue === "l_network" || activeTabValue === "p_network")
      ) {
        // console.log(`DEBUG: URL SYNC EFFECT - Path is / (implies 'table'), but activeTab is '${activeTabValue}'. SKIPPING tab change.`);
      } else {
        // console.log(`DEBUG: URL SYNC EFFECT - Path implies '${newTabBasedOnUrl}', different from active '${activeTabValue}'. SETTING tab to '${newTabBasedOnUrl}'.`);
        setActiveTabValue(newTabBasedOnUrl);
      }
    } else {
      // console.log(`DEBUG: URL SYNC EFFECT - Path implies '${newTabBasedOnUrl}', SAME as active '${activeTabValue}'. No change needed.`);
    }
  }, [activeTabValue, location.pathname]); // CRITICAL: Only depend on location.pathname

  const handleTabChangeForNavigation = (newClickedTabValue) => {
    // console.log(`DEBUG: TAB CLICK HANDLER START - Clicked: ${newClickedTabValue}, CurrentActiveTab: ${activeTabValue}, Path: ${location.pathname}`);
    const currentPath = location.pathname;
    const currentTabFromPath = getTabFromPath(currentPath); // Tab implied by the current URL *before* navigation

    // 1. Optimistically set the active tab for immediate UI feedback.
    if (activeTabValue !== newClickedTabValue) {
      // console.log(`DEBUG: TAB CLICK HANDLER - Optimistically setting active tab state from '${activeTabValue}' to '${newClickedTabValue}'.`);
      setActiveTabValue(newClickedTabValue);
    }

    const targetBasePath = getBasePathForTab(newClickedTabValue);
    const isDetailView =
      currentPath.includes("/l-zone/") ||
      currentPath.includes("/p-zone/") ||
      (currentPath.startsWith("/site/") && currentPath !== "/site");

    // console.log(`DEBUG: TAB CLICK HANDLER - currentPath: ${currentPath}, currentTabFromPath: ${currentTabFromPath}, newClickedTabValue: ${newClickedTabValue}, targetBasePath: ${targetBasePath}, isDetailView: ${isDetailView}`);

    // Scenario 1: We are in a detail view.
    if (isDetailView) {
      // If the clicked tab is DIFFERENT from the tab of the current detail view,
      // OR if we click the same tab to go to its base view.
      if (
        newClickedTabValue !== currentTabFromPath ||
        currentPath !== targetBasePath
      ) {
        // console.log(`DEBUG: TAB CLICK HANDLER (Detail View) - Navigating to target base: ${targetBasePath}.`);
        if (currentPath !== targetBasePath) {
          // Avoid redundant navigation
          navigate(targetBasePath);
        }
      } else {
        // console.log(`DEBUG: TAB CLICK HANDLER (Detail View) - Clicked same tab, already at its base. No navigation.`);
      }
    }
    // Scenario 2: We are NOT in a detail view (i.e., we are on a base path for some tab).
    else {
      // If the current path is not the target base path for the clicked tab, navigate.
      if (currentPath !== targetBasePath) {
        // console.log(`DEBUG: TAB CLICK HANDLER (Base View) - Current path ${currentPath} is not target base ${targetBasePath}. Navigating.`);
        navigate(targetBasePath);
      } else {
        // console.log(`DEBUG: TAB CLICK HANDLER (Base View) - Already at target base path ${targetBasePath}. No navigation.`);
      }
    }
    // console.log("DEBUG: TAB CLICK HANDLER END");
  };

  const chartKeySuffix = `${isAppFullscreen}-${isSidebarCollapsed}`;

  return {
    theme,
    activeTabValue,
    tabContentCardRef,
    popupAnchorCoords,
    handleTabChangeForNavigation,
    chartKeySuffix,
  };
}
