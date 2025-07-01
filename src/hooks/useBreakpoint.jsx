import { useState, useEffect } from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js"; // Adjust path if your tailwind.config.js is elsewhere

const fullConfig = resolveConfig(tailwindConfig);

const getBreakpointValue = (value) =>
  +fullConfig.theme.screens[value].slice(0, -2);

const getCurrentBreakpoint = () => {
  let currentBreakpoint = "sm";
  let biggestBreakpointValue = 0;
  for (const breakpoint of Object.keys(fullConfig.theme.screens)) {
    const breakpointValue = getBreakpointValue(breakpoint);
    if (
      breakpointValue > biggestBreakpointValue &&
      window.innerWidth >= breakpointValue
    ) {
      biggestBreakpointValue = breakpointValue;
      currentBreakpoint = breakpoint;
    }
  }
  return currentBreakpoint;
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState("sm");

  useEffect(() => {
    setBreakpoint(getCurrentBreakpoint());
    const calcInnerWidth = () => {
      setBreakpoint(getCurrentBreakpoint());
    };
    window.addEventListener("resize", calcInnerWidth);
    return () => window.removeEventListener("resize", calcInnerWidth);
  }, []);

  return breakpoint;
}
