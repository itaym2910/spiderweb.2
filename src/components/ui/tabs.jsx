import React, { useContext, createContext } from "react";

// The main Tabs component logic for controlled/uncontrolled state remains the same.
const TabsContext = createContext(undefined);

export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  className = "",
}) {
  const isControlled = value !== undefined;
  const [internalActiveTab, setInternalActiveTab] =
    React.useState(defaultValue);
  const activeTab = isControlled ? value : internalActiveTab;

  const handleTabChange = (newTabValue) => {
    if (!isControlled) {
      setInternalActiveTab(newTabValue);
    }
    if (onValueChange) {
      onValueChange(newTabValue);
    }
  };

  const contextValue = { activeTab, setActiveTab: handleTabChange };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div
      className={`grid items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "" }) {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }
  const { activeTab, setActiveTab: contextSetActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => contextSetActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-base font-medium
      ring-offset-white dark:ring-offset-gray-950
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50
      transition-all duration-200 ease-in-out
      ${
        isActive
          ? "bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 shadow-sm"
          : "hover:text-gray-800 dark:hover:text-gray-200"
      }
      ${className}`}
      data-state={isActive ? "active" : "inactive"}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
}

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
