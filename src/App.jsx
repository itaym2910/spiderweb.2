// src/App.js

import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout"; // <-- IMPORT THE NEW COMPONENT

/**
 * The root App component. Its only job is to set up the global providers
 * for Redux (state management) and React Router (navigation).
 * The actual visual structure is now handled by AppLayout.
 */
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
