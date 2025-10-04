// FILE: client/src/pages/SimpleHome.jsx
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AnimatedHero from "../components/AnimatedHero"
import FeatureShowcase from "../components/FeatureShowcase"
import AnimatedDataChart from "../components/AnimatedDataChart"
import DashboardCard from "../components/DashboardCard"
import AnimatedTestimonials from "../components/AnimatedTestimonials"
import { Icon } from "../components/Icons"

/* -----------------------------------------------------------------------------
  Currency helpers
 ----------------------------------------------------------------------------- */
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const fmt0 = (n) => fmt.format(Math.max(0, Math.round(n)))

// Sample data for charts
const monthlyData = [
  { label: 'Jan', value: 2500 },
  { label: 'Feb', value: 3200 },
  { label: 'Mar', value: 2800 },
  { label: 'Apr', value: 3600 },
  { label: 'May', value: 4200 },
  { label: 'Jun', value: 3900 }
];

const assetAllocation = [
  { label: 'Stocks', value: 45 },
  { label: 'Bonds', value: 25 },
  { label: 'Cash', value: 15 },
  { label: 'Real Estate', value: 10 },
  { label: 'Crypto', value: 5 }
];

// Sample testimonials
const testimonials = [
  {
    name: "Sarah Johnson",
    title: "Small Business Owner",
    quote: "Finico helped me understand my business cash flow in a way I never could before.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    title: "Software Engineer",
    quote: "The wealth forecast tool helped me realize I could retire 5 years earlier than I thought!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    rating: 5
  },
  {
    name: "Jennifer Lee",
    title: "Marketing Director",
    quote: "I finally got control over my budget after years of struggling.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    rating: 4
  }
];

// Sample features
const features = [
  {
    title: "Budget Planning",
    description: "Create personalized budgets that adapt to your spending habits and financial goals.",
    icon: "chartPie",
    colorFrom: "rgb(129, 140, 248)",
    colorTo: "rgb(96, 165, 250)",
    visualization: <div className="h-32">
      <AnimatedDataChart 
        data={monthlyData.map(d => ({ ...d, value: d.value * 0.8 }))} 
        title="Monthly Budget" 
        height={120} 
        showLegend={false}
      />
    </div>
  },
  {
    title: "Wealth Forecasting",
    description: "Predict your future net worth with advanced modeling based on your financial data.",
    icon: "chartLine",
    colorFrom: "rgb(52, 211, 153)",
    colorTo: "rgb(20, 184, 166)",
    visualization: <div className="h-32">
      <AnimatedDataChart 
        data={monthlyData} 
        type="line" 
        title="Wealth Growth" 
        height={120} 
        showLegend={false}
      />
    </div>
  },
  {
    title: "Risk Analysis",
    description: "Understand your investment risk profile and get tailored recommendations.",
    icon: "shieldCheck",
    colorFrom: "rgb(251, 146, 60)",
    colorTo: "rgb(249, 115, 22)",
    visualization: <div className="h-32">
      <AnimatedDataChart 
        data={assetAllocation} 
        type="pie" 
        title="Asset Allocation" 
        height={120} 
        showLegend={false}
      />
    </div>
  }
];

export default function SimpleHome() {
  const navigate = useNavigate();
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const fadeRef = useRef(null);

  // Demo rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemoIndex(prev => (prev + 1) % features.length);
      
      // Add fade animation
      if (fadeRef.current) {
        fadeRef.current.classList.add('opacity-0');
        setTimeout(() => {
          fadeRef.current?.classList.remove('opacity-0');
        }, 300);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AnimatedHero 
        title="Take Control of Your Financial Future"
        subtitle="Powerful planning tools to visualize your wealth, optimize your budget, and secure your financial freedom"
        primaryCTA={{ text: "Get Started Free", link: "/login" }}
        secondaryCTA={{ text: "See How it Works", link: "/about" }}
        showParticles={true}
      />
      
      {/* Features Showcase */}
      <FeatureShowcase features={features} />
      
      {/* Key Stats Section with animated counters */}
      <div className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Trusted by Thousands</h2>
            <p className="text-slate-600">Join our community of financially empowered users</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center perspective-container">
              <div className="card-3d p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-indigo-600 mb-2 counter-animate">25,000+</div>
                <div className="text-slate-600">Active Users</div>
              </div>
            </div>
            
            <div className="text-center perspective-container">
              <div className="card-3d p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-indigo-600 mb-2 counter-animate">$1.2B+</div>
                <div className="text-slate-600">Assets Managed</div>
              </div>
            </div>
            
            <div className="text-center perspective-container">
              <div className="card-3d p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-indigo-600 mb-2 counter-animate">98%</div>
                <div className="text-slate-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Preview Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Your Financial Dashboard</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get a clear picture of your finances with our intuitive dashboard
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <DashboardCard 
              title="Monthly Budget"
              value={fmt0(3850)}
              description="You're on track with your monthly budget"
              change={5.3}
              color="blue"
              icon={<Icon name="chartBar" className="h-4 w-4" />}
              showExpand={true}
            >
              <AnimatedDataChart 
                data={monthlyData} 
                title="Monthly Spending" 
                height={200}
                showLegend={false}
              />
            </DashboardCard>
            
            <DashboardCard 
              title="Net Worth"
              value={fmt0(285000)}
              description="Your net worth is growing steadily"
              change={12.4}
              color="green"
              icon={<Icon name="trendingUp" className="h-4 w-4" />}
              showExpand={true}
            >
              <AnimatedDataChart 
                data={monthlyData.map(d => ({ ...d, value: d.value * 75 }))} 
                type="line"
                title="Net Worth Growth" 
                height={200}
                showLegend={false}
              />
            </DashboardCard>
            
            <DashboardCard 
              title="Investments"
              value={fmt0(172500)}
              description="Your portfolio allocation"
              change={-2.1}
              changeTimeframe="this week"
              color="purple"
              icon={<Icon name="chartPie" className="h-4 w-4" />}
              showExpand={true}
            >
              <AnimatedDataChart 
                data={assetAllocation} 
                type="pie"
                title="Asset Allocation" 
                height={200}
                showLegend={true}
              />
            </DashboardCard>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <AnimatedTestimonials testimonials={testimonials} />
      
      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Financial Journey?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their financial future with Finico
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="btn-interactive rounded-xl bg-white px-8 py-3 font-medium text-indigo-600 shadow-lg hover:bg-white/95"
            >
              Get Started Free
            </Link>
            <Link 
              to="/about" 
              className="btn-interactive rounded-xl bg-transparent border border-white px-8 py-3 font-medium text-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}