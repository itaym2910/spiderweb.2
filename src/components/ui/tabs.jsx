// src/components/ui/tabs.jsx
import React, { useState, useContext, createContext } from "react"; // Ensure useContext and createContext are imported

// 1. Define the context
const TabsContext = createContext(undefined);

// 2. Modify the Tabs component
export function Tabs({
  children,
  defaultValue,
  onValueChange,
  className = "",
}) {
  // Added onValueChange and className props
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleSetActiveTab = (newTabValue) => {
    setActiveTab(newTabValue);
    if (onValueChange) {
      // If onValueChange prop is provided, call it
      onValueChange(newTabValue);
    }
  };

  const contextValue = {
    activeTab,
    setActiveTab: handleSetActiveTab, // Use the new handler
    // No need to pass onValueChange down through context if setActiveTab handles it
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>{" "}
      {/* Apply the className to the root div */}
    </TabsContext.Provider>
  );
}

// 3. TabsList remains the same (it's presentational)
export function TabsList({ children, className = "" }) {
  return (
    <div
      className={`flex gap-2 border-b pb-2 border-gray-300 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  );
}

// 4. Modify TabsTrigger to use the context's setActiveTab
export function TabsTrigger({ value, children, className = "" }) {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("TabsTrigger must be used within a TabsProvider");
  }
  const { activeTab, setActiveTab: contextSetActiveTab } = context; // Renamed to avoid confusion
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => contextSetActiveTab(value)} // This will now also trigger onValueChange via handleSetActiveTab
      className={`px-4 py-1.5 rounded-t-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-white dark:bg-gray-800 border border-b-0 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      } ${className}`}
      data-state={isActive ? "active" : "inactive"} // Good practice to add data-state for styling/testing
      role="tab"
      aria-selected={isActive}
      // You might want to add aria-controls if TabsContent elements have IDs
    >
      {children}
    </button>
  );
}

// 5. TabsContent - ensure it uses the context correctly
export function TabsContent({ value, children, className = "" }) {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error("TabsContent must be used within a TabsProvider");
  }
  const { activeTab } = context;

  if (activeTab !== value) return null;

  return (
    <div
      className={`mt-4 ${className}`}
      role="tabpanel"
      // You might want to add an ID and aria-labelledby if TabsTriggers have IDs
    >
      {children}
    </div>
  );
}
