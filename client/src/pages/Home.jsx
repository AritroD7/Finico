// FILE: client/src/pages/Home.jsx
import { useEffect, useMemo, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"

/* -----------------------------------------------------------------------------
  3D Card Effect Hook
 ----------------------------------------------------------------------------- */
function use3DCard() {
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = ((y - centerY) / centerY) * -10
      const rotateY = ((x - centerX) / centerX) * 10
      setRotateX(rotateX)
      setRotateY(rotateY)
    }

    const handleMouseLeave = () => {
      setRotateX(0)
      setRotateY(0)
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return { cardRef, rotateX, rotateY }
}

/* -----------------------------------------------------------------------------
  Inline icon set (no external deps)
 ----------------------------------------------------------------------------- */
function Icon({ name, className = "h-4 w-4", stroke = "currentColor" }) {
  const p = { fill: "none", stroke, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }
  switch (name) {
    case "flash":   return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M13 2L3 14h7l-1 8L21 8h-7l-1-6z"/></svg>)
    case "lock":    return (<svg viewBox="0 0 24 24" className={className} {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>)
    case "export":  return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><rect x="4" y="15" width="16" height="6" rx="2"/></svg>)
    case "calc":    return (<svg viewBox="0 0 24 24" className={className} {...p}><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 6h10M7 10h4M7 14h4M7 18h10"/></svg>)
    case "book":    return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M20 22H6.5A2.5 2.5 0 014 19.5V5.6A2.6 2.6 0 016.6 3H20v19z"/><path d="M8 3v14"/></svg>)
    case "arrow":   return (<svg viewBox="0 0 24 24" className={className} {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>)
    default:        return null
  }
}

/* -----------------------------------------------------------------------------
  Interactive Particle Background
 ----------------------------------------------------------------------------- */
function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 50

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.opacity = Math.random() * 0.5 + 0.3
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 opacity-30"
      style={{ pointerEvents: "none" }}
    />
  )
}

/* -----------------------------------------------------------------------------
  Main Hero Section with Animated Text
 ----------------------------------------------------------------------------- */
function Hero() {
  const [textIndex, setTextIndex] = useState(0)
  const phrases = ["Plan Your Future", "Track Your Wealth", "Master Your Money", "Achieve Freedom"]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/50 px-3 py-1 text-xs font-semibold text-blue-700">
        <span className="h-2 w-2 rounded-full bg-blue-500" /> New • Polished Budget + local scenarios
      </div>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-[44px]">
        Plan, forecast, and <span className="brand-text">stress-test your money</span>.
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Budgeting, forecasting, risk analysis, and net-worth tracking — fast, clear, and privacy-first.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link to="/budget" className="btn-primary">Plan my budget</Link>
        <Link to="/forecast" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Run a forecast <Icon name="arrow" className="h-4 w-4" />
        </Link>
        <Link to="/help" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          Learn finance <Icon name="book" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* -----------------------------------------------------------------------------
  Interactive Dashboard Preview
 ----------------------------------------------------------------------------- */
function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("overview")
  const { cardRef, rotateX, rotateY } = use3DCard()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold text-slate-900">Quick demo</div>
        <button
          className="text-xs text-blue-700 hover:underline"
          onClick={() => { setIncome(3200); setRent(1200); setGroceries(300) }}
        >
          Try it ↓
        </button>
      </div>

      {/* Inputs */}
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <label className="text-[12px] font-semibold text-slate-600">Monthly income</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value || 0))}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-[11px] text-slate-500">Tip: use whole numbers; you can fine-tune later.</p>
        </div>
        <div>
          <label className="text-[12px] font-semibold text-slate-600">Rent</label>
          <input
            type="number"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value || 0))}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-slate-600">Groceries</label>
          <input
            type="number"
            value={groceries}
            onChange={(e) => setGroceries(Number(e.target.value || 0))}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Outputs (robust layout) */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        {/* Donut + numbers (never shrink) */}
        <div className="flex w-full flex-none items-center gap-4 md:w-auto">
          <SavingsMeter pct={pct} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Savings</div>
            <div className="text-xl font-bold text-slate-900">{fmt0(savings)}</div>
            <div className="text-[12px] text-slate-600">of {fmt0(income)} income</div>
          </div>
        </div>

        {/* Sparkline block (strict height + full width) */}
        <div className="w-full min-w-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="h-20 w-full overflow-hidden">
              <TinySparkline points={spark} stroke="#60a5fa" />
            </div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        }`}>
          {change}
        </span>
      </div>

      {/* CTAs */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => nav("/budget")}>Open Budget</button>
        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => nav("/forecast")}
        >
          Forecast
        </button>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
  Features Section with Cards
 ----------------------------------------------------------------------------- */
function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms analyze your spending patterns and provide personalized recommendations.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "256-bit encryption and multi-factor authentication keep your financial data completely secure.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Monte Carlo Simulations",
      description: "Run thousands of scenarios to understand your financial future with statistical confidence.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-Time Analytics",
      description: "Get instant updates on your portfolio performance and risk metrics as markets move.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Market Data",
      description: "Access real-time data from 50+ exchanges worldwide for comprehensive analysis.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your data stays on your device. We never sell or share your personal information.",
      gradient: "from-red-500 to-pink-500"
    }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="text-[15px] font-semibold text-slate-900">Why Finico?</div>
      <ul className="mt-3 space-y-3">
        {items.map((it) => (
          <li key={it.title} className="flex items-start gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50">
              <Icon name={it.icon} className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{it.title}</div>
              <div className="text-sm text-slate-600">{it.desc}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-slate-700">Education</div>
            <div className="text-sm text-slate-600">Bite-sized guides for budgeting & risk.</div>
          </div>
          <Link to="/help" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
            Read guides <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
  Stats Section
 ----------------------------------------------------------------------------- */
function StatsSection() {
  const stats = [
    { value: 50000, suffix: "+", label: "Active Users" },
    { value: 2.5, prefix: "$", suffix: "M+", label: "Assets Tracked" },
    { value: 99.9, suffix: "%", label: "Uptime" },
    { value: 4.9, suffix: "/5", label: "User Rating" }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="text-[15px] font-semibold text-slate-900">At a glance</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] font-semibold tracking-wide text-slate-500">{s.label}</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Recent activity</div>
          <Link to="/help" className="text-xs text-blue-700 hover:underline">View details</Link>
        </div>
        <div className="mt-2 h-20 w-full overflow-hidden">
          <TinySparkline points={activity} stroke="#6366f1" />
        </div>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">Numbers are illustrative; real usage updates soon.</p>
    </div>
  )
}

function InsightsSection() {
  const cards = [
    { tag: "Guide • 6 min", title: "The 50/30/20 rule — still useful in 2025?", blurb: "A quick primer with real-world tweaks for high-inflation periods.", href: "/help" },
    { tag: "Guide • 4 min", title: "Nominal vs real returns (and why it matters).", blurb: "See how inflation changes your wealth picture, with a tiny example.", href: "/help" },
    { tag: "Guide • 5 min", title: "Monte-Carlo: plan for best / worst cases.", blurb: "Stress-test your plan so surprises don’t derail your goals.", href: "/risk" },
  ]
  return (
    <section className="mx-auto mt-10 max-w-6xl px-4">
      <div className="text-xl font-bold text-slate-900">Financial insights</div>
      <p className="mt-1 text-slate-600">Bite-sized guides to build confidence with money.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="pointer-events-none absolute -inset-12 -z-10 aurora-bg opacity-30 transition-opacity group-hover:opacity-50" />
            <div className="text-[11px] font-semibold text-blue-700">{c.tag}</div>
            <h3 className="mt-1 text-[15px] font-semibold text-slate-900">{c.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{c.blurb}</p>
            <Link to={c.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline">
              Read <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-4">
        <Link to="/help" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
          View all insights <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

/* -----------------------------------------------------------------------------
  Testimonial Card
 ----------------------------------------------------------------------------- */
function TestimonialCard({ name, role, company, image, content, rating, index }) {
  return (
    <div
      className="p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-gray-700 transition-all duration-300"
      style={{
        animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p className="text-gray-300 mb-6 italic">"{content}"</p>

      <div className="flex items-center gap-3">
        <img
          src={image}
          alt={name}
          className="w-12 h-12 rounded-full border-2 border-gray-700"
        />
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-sm text-gray-400">{role} at {company}</div>
        </div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------------
  CTA Section
 ----------------------------------------------------------------------------- */
function CTASection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 md:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Start Your Financial Journey Today
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join 50,000+ users who are taking control of their financial future with data-driven insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/budget"
                className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg hover:bg-gray-100 transform transition-all hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/help"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-semibold text-lg border border-white/30 hover:bg-white/30 transform transition-all hover:scale-105"
              >
                Learn More
              </Link>
            </div>

            <p className="mt-8 text-white/70 text-sm">
              No credit card required • Free forever plan • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -----------------------------------------------------------------------------
  Main Page Component
 ----------------------------------------------------------------------------- */
export default function Home() {
  useEffect(() => {
    // Add custom styles for animations
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      
      @keyframes gradient-x {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      @keyframes grow {
        0% { height: 0; }
        100% { height: var(--height); }
      }
      
      .animate-blob { animation: blob 7s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
      .animation-delay-200 { animation-delay: 0.2s; }
      .animation-delay-400 { animation-delay: 0.4s; }
      .animation-delay-600 { animation-delay: 0.6s; }
      
      .animate-gradient-x {
        background-size: 200% 200%;
        animation: gradient-x 4s ease infinite;
      }
      
      .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out both;
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #1f2937;
      }
      
      .slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        cursor: pointer;
        border-radius: 50%;
        border: 2px solid #1f2937;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Hero />
      <section className="mx-auto mt-5 max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickDemoCard />
          <WhyFinicoCard />
          <AtAGlanceCard />
        </div>
      </section>
      <InsightsSection />
      <FloatingTips />
    </div>
  )
}