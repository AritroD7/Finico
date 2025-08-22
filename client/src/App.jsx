import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import BudgetPlanner from "./pages/BudgetPlanner"
import WealthForecast from "./pages/WealthForecast"
import RiskModeling from "./pages/RiskModeling"
import GoalPlanner from "./pages/GoalPlanner"
import Help from "./pages/Help"
import Account from "./pages/Account"
import Login from "./pages/Login"
import AuthCallback from "./pages/AuthCallback"
import Protected from "./components/Protected"
import "./index.css"
import "./styles/ui.css"
import { CurrencyProvider } from './context/Currency'

function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} Finance Forecaster · Educational models only — not investment advice.
        </p>
        <nav className="text-sm text-slate-600">
          <a className="hover:text-slate-900" href="/about">About</a>
          <span className="mx-2">•</span>
          <a className="hover:text-slate-900" href="/help">Help</a>
          <span className="mx-2">•</span>
          <a className="hover:text-slate-900" href="/privacy">Privacy</a>
        </nav>
      </div>
    </footer>
  )
}

function PageContainer({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <PageContainer>
      <div className="card">
        <h1 className="text-lg font-semibold mb-2">Page not found</h1>
        <p className="text-slate-600">The page you’re looking for doesn’t exist.</p>
      </div>
    </PageContainer>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PageContainer><Home /></PageContainer>} />
      <Route path="/budget" element={<PageContainer><BudgetPlanner /></PageContainer>} />
      <Route path="/forecast" element={<PageContainer><WealthForecast /></PageContainer>} />
      <Route path="/risk" element={<PageContainer><RiskModeling /></PageContainer>} />
      <Route path="/goal" element={<Protected><PageContainer><GoalPlanner /></PageContainer></Protected>} />
      <Route path="/help" element={<PageContainer><Help /></PageContainer>} />
      <Route path="/account" element={<PageContainer><Account /></PageContainer>} />
      <Route path="/login" element={<PageContainer><Login /></PageContainer>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}