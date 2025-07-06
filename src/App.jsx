// src/App.jsx

import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your components
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AppInitializer } from "./components/auth/AppInitializer";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Route: Anyone can access the login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes: Only accessible if logged in */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                {/* The AppInitializer now wraps the main layout */}
                <AppInitializer>
                  <AppLayout />
                </AppInitializer>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
