// FILE: client/src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, Home, PieChart, TrendingUp, Shield, Calculator, Wallet, HelpCircle, User, LogIn, Sparkles, ArrowRight, BarChart3, DollarSign, Target, Activity, BookOpen, FileText, MessageSquare, Award } from "lucide-react"
import logo from "../assets/finico-high-resolution-logo-transparent.png"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const location = useLocation()
  const servicesRef = useRef(null)
  const resourcesRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
    setResourcesOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServicesOpen(false)
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target)) {
        setResourcesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center text-sm">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>🎉 New Feature: AI-Powered Financial Insights Now Available!</span>
          <Link to="/help" className="underline font-semibold hover:text-blue-100 transition-colors">
            Learn More →
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-800" 
          : "bg-gray-900/80 backdrop-blur-md"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-xl border border-gray-700 group-hover:border-gray-600 transition-colors">
                  <img
                    src={logo}
                    alt="Finico"
                    className="h-10 w-auto object-contain filter brightness-110"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-white">Finico</div>
                <div className="text-xs text-gray-400">Smart Finance</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Services Dropdown */}
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                </button>

                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-2">
                      <DropdownItem to="/budget" icon={<PieChart className="w-5 h-5" />} title="Budget Planner" desc="Track income & expenses" />
                      <DropdownItem to="/forecast" icon={<TrendingUp className="w-5 h-5" />} title="Wealth Forecast" desc="Project future wealth" />
                      <DropdownItem to="/risk" icon={<Shield className="w-5 h-5" />} title="Risk Analysis" desc="Monte Carlo simulations" />
                      <DropdownItem to="/loans" icon={<Calculator className="w-5 h-5" />} title="Loan Calculator" desc="Amortization schedules" />
                      <DropdownItem to="/networth" icon={<Wallet className="w-5 h-5" />} title="Net Worth" desc="Track assets & liabilities" />
                    </div>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative" ref={resourcesRef}>
                <button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
                </button>

                {resourcesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 p-4">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Learn</h3>
                        <ResourceLink icon={<BookOpen className="w-4 h-4" />} title="Guides" href="/help" />
                        <ResourceLink icon={<FileText className="w-4 h-4" />} title="Documentation" href="/help" />
                        <ResourceLink icon={<MessageSquare className="w-4 h-4" />} title="Blog" href="/help" />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Company</h3>
                        <ResourceLink icon={<Award className="w-4 h-4" />} title="About Us" href="/help" />
                        <ResourceLink icon={<User className="w-4 h-4" />} title="Careers" href="/help" />
                        <ResourceLink icon={<HelpCircle className="w-4 h-4" />} title="Support" href="/help" />
                      </div>
                    </div>
                    
                    {/* Featured Content */}
                    <div className="border-t border-gray-800 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">Market Update</h4>
                          <p className="text-xs text-gray-400 mb-2">
                            S&P 500 reaches new highs. Learn how this affects your portfolio.
                          </p>
                          <Link to="/help" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                            Read analysis →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink
                to="/help"
                className={({ isActive }) => `px-4 py-2 text-gray-300 hover:text-white transition-colors ${isActive ? "text-white" : ""}`}
              >
                Help
              </NavLink>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/budget"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-2">
                <MobileNavLink to="/" icon={<Home className="w-5 h-5" />}>Home</MobileNavLink>
                
                {/* Mobile Services Section */}
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Services</div>
                  <MobileNavLink to="/budget" icon={<PieChart className="w-5 h-5" />}>Budget Planner</MobileNavLink>
                  <MobileNavLink to="/forecast" icon={<TrendingUp className="w-5 h-5" />}>Wealth Forecast</MobileNavLink>
                  <MobileNavLink to="/risk" icon={<Shield className="w-5 h-5" />}>Risk Analysis</MobileNavLink>
                  <MobileNavLink to="/loans" icon={<Calculator className="w-5 h-5" />}>Loan Calculator</MobileNavLink>
                  <MobileNavLink to="/networth" icon={<Wallet className="w-5 h-5" />}>Net Worth</MobileNavLink>
                </div>

                {/* Mobile Resources Section */}
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-2">Resources</div>
                  <MobileNavLink to="/help" icon={<HelpCircle className="w-5 h-5" />}>Help Center</MobileNavLink>
                </div>

                {/* Mobile Actions */}
                <div className="border-t border-gray-800 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </Link>
                  <Link
                    to="/budget"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${scrolled ? "20%" : "0%"}` }}
        />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}

/* Dropdown Item Component */
function DropdownItem({ to, icon, title, desc }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors group"
    >
      <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:bg-gray-700 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </Link>
  )
}

/* Resource Link Component */
function ResourceLink({ icon, title, href }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
    >
      {icon}
      <span className="text-sm">{title}</span>
    </Link>
  )
}

/* Mobile Nav Link Component */
function MobileNavLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${isActive 
          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30" 
          : "text-gray-300 hover:text-white hover:bg-gray-800"
        }
      `}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </NavLink>
  )
}