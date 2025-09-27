// FILE: client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./index.css";
import "./styles/ui.css"; // <- extra guard so UI styles are definitely loaded

import ErrorBoundary from "./components/ErrorBoundary";
import { ToasterProvider } from "./components/Toaster";
import { CurrencyProvider } from "./context/Currency";
import { AuthProvider } from "./hooks/useAuth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToasterProvider>
        <CurrencyProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </CurrencyProvider>
      </ToasterProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
