// App.js
import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Sidebar } from "./components/ui/sidebar";
import MainPage from "./MainPage";

function App() {
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  let pageTitle = currentPage;
  if (currentPage === "Notifications") {
    pageTitle = "Alerts";
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-[100vh] bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          collapsed={isSidebarCollapsed}
          setCollapsed={setIsSidebarCollapsed}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-hidden">
          <header className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
          </header>
          <MainPage currentPage={currentPage} />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
