import React from "react";
import { Sidebar } from "./components/ui/sidebar";
import MainPage from "./MainPage";

function App() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <Sidebar />
      <main className="flex-1 p-4">
        <MainPage />
      </main>
    </div>
  );
}

export default App;
