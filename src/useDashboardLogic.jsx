// src/useDashboardLogic.js
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useDashboardLogic({ isAppFullscreen, isSidebarCollapsed }) {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [activeTabValue, setActiveTabValue] = useState("table");

  const navigate = useNavigate();
  const location = useLocation();

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

  const handleTabChangeForNavigation = (newTab) => {
    setActiveTabValue(newTab);

    const currentPath = location.pathname;
    const isOnLZoneDetail = currentPath.includes("/l-zone/");
    const isOnPZoneDetail = currentPath.includes("/p-zone/");

    if (isOnLZoneDetail || isOnPZoneDetail) {
      let calculatedBasePath = currentPath;
      if (isOnLZoneDetail) {
        calculatedBasePath = currentPath.split("/l-zone/")[0];
      } else if (isOnPZoneDetail) {
        calculatedBasePath = currentPath.split("/p-zone/")[0];
      }
      calculatedBasePath =
        calculatedBasePath === "" || calculatedBasePath === undefined
          ? "/"
          : calculatedBasePath;
      if (!calculatedBasePath.startsWith("/")) {
        calculatedBasePath = "/" + calculatedBasePath;
      }
      if (calculatedBasePath !== currentPath) {
        try {
          navigate(calculatedBasePath);
        } catch (e) {
          console.error("Navigation error in handleTabChange:", e);
        }
      }
    }
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
