import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
// client/src/main.jsx (top)
//import './index.css';
//import './styles.css';
import '../src/styles/ui.css'; // <- import last
import { AuthProvider } from "./hooks/useAuth.jsx"
import { CurrencyProvider } from "./context/Currency.jsx"

import './styles/ui.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
