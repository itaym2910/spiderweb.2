// src/components/ui/tabs.jsx
import React, { useState, useContext, createContext, useEffect } from "react"; // Ensure useEffect is imported if you sync prop to state

const TabsContext = createContext(undefined);

export function Tabs({
  children,
  value, // This is the externally controlled value (activeTabValue from DashboardPage)
  defaultValue, // Used if 'value' is not provided (uncontrolled mode)
  onValueChange, // Callback when the user clicks a tab trigger
  className = "",
}) {
  // Determine if the component is controlled by checking if 'value' prop is provided
  const isControlled = value !== undefined;

  // Internal state for uncontrolled mode.
  // If controlled, this state is not the source of truth for 'activeTab'.
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);

  // The 'effective' active tab. If controlled, it's the 'value' prop.
  // Otherwise, it's the internal state.
  const activeTab = isControlled ? value : internalActiveTab;

  // This effect ensures that if the component is switched from uncontrolled to controlled
  // or if defaultValue changes for an uncontrolled component, it reflects.
  // For a purely controlled component, this isn't strictly necessary if 'value' is always used.
  // However, it's good practice for components that can be both.
  useEffect(() => {
    if (!isControlled && defaultValue !== internalActiveTab) {
      setInternalActiveTab(defaultValue);
    }
  }, [defaultValue, isControlled, internalActiveTab]);

  const handleTabChange = (newTabValue) => {
    // If not controlled, update internal state
    if (!isControlled) {
      setInternalActiveTab(newTabValue);
    }
    // Always call onValueChange if provided, regardless of controlled status.
    // This allows the parent to react to user interactions.
    if (onValueChange) {
      onValueChange(newTabValue);
    }
  };

  const contextValue = {
    activeTab: activeTab, // Use the effective activeTab
    setActiveTab: handleTabChange, // This will be called by TabsTrigger
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// TabsList remains the same
export function TabsList({ children, className = "" }) {
  return (
    <div
      className={`flex gap-2 border-b pb-2 border-gray-300 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

// TabsTrigger remains the same - it calls context.setActiveTab
export function TabsTrigger({ value, children, className = "" }) {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("TabsTrigger must be used within a TabsProvider");
  }
  const { activeTab, setActiveTab: contextSetActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => contextSetActiveTab(value)}
      className={`px-4 py-1.5 rounded-t-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-white dark:bg-gray-800 border border-b-0 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      } ${className}`}
      data-state={isActive ? "active" : "inactive"}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
}

// TabsContent remains the same - it reads context.activeTab
export function TabsContent({ value, children, className = "" }) {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("TabsContent must be used within a TabsProvider");
  }
  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div className={`mt-4 ${className}`} role="tabpanel">
      {children}
    </div>
  );
}
