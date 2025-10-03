// FILE: client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import BudgetPlanner from "./pages/BudgetPlanner"
import WealthForecast from "./pages/WealthForecast"
import RiskModeling from "./pages/RiskModeling"
import LoanCalculator from "./pages/LoanCalculator"
import NetWorth from "./pages/NetWorth"
import Help from "./pages/Help"
import Account from "./pages/Account"
import Login from "./pages/Login"
import AuthCallback from "./pages/AuthCallback"

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 text-slate-900">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/budget" element={<BudgetPlanner />} />
          <Route path="/forecast" element={<WealthForecast />} />
          <Route path="/risk" element={<RiskModeling />} />
          <Route path="/loans" element={<LoanCalculator />} />
          <Route path="/networth" element={<NetWorth />} />
          <Route path="/help" element={<Help />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
