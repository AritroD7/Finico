// FILE: client/src/components/Footer.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  Twitter, Github, Linkedin, Youtube, Facebook, Instagram,
  Mail, Phone, MapPin, Send, ChevronRight, ExternalLink,
  Shield, Award, Users, Star, ArrowUp, Heart
} from "lucide-react"
import logo from "../assets/finico-high-resolution-logo-transparent.png"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [subscribeStatus, setSubscribeStatus] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribeStatus("success")
      setTimeout(() => {
        setEmail("")
        setSubscribeStatus("")
      }, 3000)
    }
  }

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Show/hide scroll to top button
  useState(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-blue-500/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Stay ahead of your finances
                  </h3>
                  <p className="text-gray-400">
                    Get weekly insights, market updates, and exclusive financial tips delivered to your inbox.
                  </p>
                </div>
                
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  {subscribeStatus === "success" && (
                    <p className="text-green-400 text-sm animate-fade-in">
                      ✓ Successfully subscribed! Check your email.
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gray-900 p-3 rounded-xl border border-gray-800">
                    <img src={logo} alt="Finico" className="h-12 w-auto" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Finico</div>
                  <div className="text-sm text-gray-400">Smart Financial Planning</div>
                </div>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-sm">
              Empowering individuals with institutional-grade financial tools. 
              Plan, track, and optimize your wealth with confidence.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-300">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-300">SOC 2 Certified</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <SocialIcon href="#" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
              <SocialIcon href="#" icon={<Github className="w-5 h-5" />} label="GitHub" />
              <SocialIcon href="#" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
              <SocialIcon href="#" icon={<Youtube className="w-5 h-5" />} label="YouTube" />
              <SocialIcon href="#" icon={<Facebook className="w-5 h-5" />} label="Facebook" />
              <SocialIcon href="#" icon={<Instagram className="w-5 h-5" />} label="Instagram" />
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-3">
              <FooterLink to="/budget">Budget Planner</FooterLink>
              <FooterLink to="/forecast">Wealth Forecast</FooterLink>
              <FooterLink to="/risk">Risk Analysis</FooterLink>
              <FooterLink to="/loans">Loan Calculator</FooterLink>
              <FooterLink to="/networth">Net Worth Tracker</FooterLink>
              <FooterLink to="/help" badge="New">AI Assistant</FooterLink>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <FooterLink to="/help">Help Center</FooterLink>
              <FooterLink to="/help">Documentation</FooterLink>
              <FooterLink to="/help">API Reference</FooterLink>
              <FooterLink to="/help">Blog</FooterLink>
              <FooterLink to="/help">Guides & Tutorials</FooterLink>
              <FooterLink to="/help">Community Forum</FooterLink>
              <FooterLink to="/help">Webinars</FooterLink>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <FooterLink to="/help">About Us</FooterLink>
              <FooterLink to="/help">Careers</FooterLink>
              <FooterLink to="/help">Press Kit</FooterLink>
              <FooterLink to="/help">Partners</FooterLink>
              <FooterLink to="/help">Investors</FooterLink>
              <FooterLink to="/help">Contact</FooterLink>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <FooterLink to="/help">Terms of Service</FooterLink>
              <FooterLink to="/help">Privacy Policy</FooterLink>
              <FooterLink to="/help">Cookie Policy</FooterLink>
              <FooterLink to="/help">GDPR Compliance</FooterLink>
              <FooterLink to="/help">Security</FooterLink>
              <FooterLink to="/help">Licenses</FooterLink>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-800">
          <StatItem value="50K+" label="Active Users" />
          <StatItem value="$2.5M+" label="Assets Tracked" />
          <StatItem value="99.9%" label="Uptime" />
          <StatItem value="4.9★" label="User Rating" />
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
          <ContactItem
            icon={<Mail className="w-5 h-5" />}
            label="Email Us"
            value="support@finico.app"
            href="mailto:support@finico.app"
          />
          <ContactItem
            icon={<Phone className="w-5 h-5" />}
            label="Call Us"
            value="+1 (555) 123-4567"
            href="tel:+15551234567"
          />
          <ContactItem
            icon={<MapPin className="w-5 h-5" />}
            label="Visit Us"
            value="123 Finance St, NY 10001"
            href="#"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>© 2025 Finico. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Built with</span>
              <Heart className="w-4 h-4 text-red-500 hidden md:inline" />
              <span className="hidden md:inline">for financial freedom</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                Status
              </Link>
              <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                Changelog
              </Link>
              <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Language:</span>
                <select className="bg-transparent text-gray-300 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transform transition-all hover:scale-110 z-40"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </footer>
  )
}

/* Component: Social Icon */
function SocialIcon({ href, icon, label }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="p-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all transform hover:scale-110"
    >
      {icon}
    </a>
  )
}

/* Component: Footer Link */
function FooterLink({ to, children, badge }) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
        <span>{children}</span>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
            {badge}
          </span>
        )}
      </Link>
    </li>
  )
}

/* Component: Stat Item */
function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        {value}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

/* Component: Contact Item */
function ContactItem({ icon, label, value, href }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 group hover:bg-gray-800/50 p-3 rounded-xl transition-all"
    >
      <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-white group-hover:text-blue-400 transition-colors">
          {value}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  )
}