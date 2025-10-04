import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PremiumHero from '../components/PremiumHero';
import PremiumFeatures from '../components/PremiumFeatures';
import PremiumDashboardPreview from '../components/PremiumDashboardPreview';
import PremiumTestimonials from '../components/PremiumTestimonials';
import PremiumCTA from '../components/PremiumCTA';
import '../styles/premium.css';

const PremiumHome = () => {
  // Sample data for components
  const heroData = {
    heading: "Take Control of Your Financial Future",
    subheading: "The intelligent platform for financial planning, wealth tracking, and goal achievement with personalized insights.",
    primaryAction: {
      label: "Get Started Free",
      link: "/signup"
    },
    secondaryAction: {
      label: "See How It Works",
      link: "#dashboard"
    },
    stats: [
      { value: "50K+", label: "Active Users" },
      { value: "$1.2B", label: "Assets Tracked" },
      { value: "98%", label: "Satisfaction" },
    ]
  };

  const features = [
    {
      id: 'wealth-tracking',
      title: 'Wealth Tracking',
      description: 'Monitor all your assets, investments, and liabilities in one secure dashboard with real-time updates.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      stats: [
        { label: 'Connected Accounts', value: '50+' },
        { label: 'Update Frequency', value: 'Real-time' }
      ]
    },
    {
      id: 'goal-planning',
      title: 'Goal Planning',
      description: 'Set and achieve your financial goals with intelligent planning tools and personalized guidance.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      stats: [
        { label: 'Goal Types', value: '15+' },
        { label: 'Success Rate', value: '94%' }
      ]
    },
    {
      id: 'ai-insights',
      title: 'AI Insights',
      description: 'Receive personalized recommendations to optimize your spending, investing, and saving strategies.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      stats: [
        { label: 'Custom Insights', value: 'Weekly' },
        { label: 'Avg. Savings', value: '23%' }
      ]
    },
    {
      id: 'risk-modeling',
      title: 'Risk Modeling',
      description: 'Model different financial scenarios and visualize potential outcomes to make better decisions.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      stats: [
        { label: 'Scenario Models', value: 'Unlimited' },
        { label: 'Simulation Accuracy', value: '97%' }
      ]
    }
  ];

  const dashboardData = {
    summaryCards: [
      {
        label: 'Total Assets',
        value: '$284,502',
        change: '+12.4%',
        changeColor: 'bg-green-100 text-green-800',
        chart: (
          <svg viewBox="0 0 100 30" className="h-full w-full">
            <path
              d="M0,15 L10,14 L20,16 L30,12 L40,10 L50,14 L60,13 L70,11 L80,5 L90,2 L100,0"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )
      },
      {
        label: 'Total Debt',
        value: '$42,150',
        change: '-3.2%',
        changeColor: 'bg-green-100 text-green-800',
        chart: (
          <svg viewBox="0 0 100 30" className="h-full w-full">
            <path
              d="M0,5 L10,7 L20,10 L30,8 L40,12 L50,14 L60,13 L70,15 L80,18 L90,16 L100,15"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )
      },
      {
        label: 'Net Worth',
        value: '$242,352',
        change: '+15.8%',
        changeColor: 'bg-green-100 text-green-800',
        chart: (
          <svg viewBox="0 0 100 30" className="h-full w-full">
            <path
              d="M0,20 L10,18 L20,15 L30,16 L40,12 L50,10 L60,8 L70,9 L80,5 L90,3 L100,2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )
      },
      {
        label: 'Monthly Income',
        value: '$8,450',
        subValue: '/month',
        change: 'Stable',
        changeColor: 'bg-blue-100 text-blue-800',
        chart: (
          <svg viewBox="0 0 100 30" className="h-full w-full">
            <path
              d="M0,15 L10,15 L20,15 L30,16 L40,14 L50,15 L60,15 L70,15 L80,15 L90,16 L100,15"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )
      }
    ],
    assetAllocation: [
      { name: 'Stocks', percentage: 45, color: '#3b82f6' },
      { name: 'Real Estate', percentage: 30, color: '#10b981' },
      { name: 'Cash', percentage: 15, color: '#6366f1' },
      { name: 'Crypto', percentage: 10, color: '#f59e0b' }
    ],
    recentTransactions: [
      {
        name: 'Salary Deposit',
        amount: '+$4,250.00',
        date: 'May 15, 2023',
        category: 'Income',
        amountColor: 'text-green-600',
        iconBg: 'bg-green-100 text-green-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        )
      },
      {
        name: 'Mortgage Payment',
        amount: '-$1,850.00',
        date: 'May 12, 2023',
        category: 'Housing',
        amountColor: 'text-red-600',
        iconBg: 'bg-red-100 text-red-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        )
      },
      {
        name: 'Stock Dividend',
        amount: '+$320.50',
        date: 'May 10, 2023',
        category: 'Investment',
        amountColor: 'text-green-600',
        iconBg: 'bg-blue-100 text-blue-800',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        )
      }
    ]
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'Small Business Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      quote: "Finico helped me organize my business finances and personal investments in one place. The goal planning features allowed me to save for expanding my business while maintaining my retirement plans.",
    },
    {
      name: 'Michael Chen',
      title: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      quote: "As someone who loves data, I appreciate how Finico visualizes my financial health. The AI insights have helped me optimize my investment strategy and increase my returns by 18% in the first year.",
    },
    {
      name: 'Olivia Rodriguez',
      title: 'Healthcare Professional',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
      quote: "With unpredictable work hours, I struggled to manage my finances properly. Finico's automated tracking and smart notifications keep me on top of my finances without requiring hours of my limited free time.",
    },
    {
      name: 'David Williams',
      title: 'Recent Graduate',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
      quote: "Starting my career with student debt was overwhelming. Finico's debt repayment strategies and budget planning tools have put me on track to be debt-free 5 years earlier than I initially planned.",
    }
  ];
  
  const ctaContent = {
    title: "Start Your Financial Journey Today",
    description: "Join over 50,000 users who are achieving their financial goals with Finico's powerful platform.",
    primaryAction: {
      label: "Start Free Trial",
      link: "/signup"
    },
    secondaryAction: {
      label: "Book a Demo",
      link: "/demo"
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <PremiumHero {...heroData} />
      
      {/* Features Section */}
      <PremiumFeatures features={features} />
      
      {/* Dashboard Preview Section */}
      <div id="dashboard">
        <PremiumDashboardPreview data={dashboardData} />
      </div>
      
      {/* Testimonials Section */}
      <PremiumTestimonials testimonials={testimonials} />
      
      {/* Call to Action Section */}
      <PremiumCTA {...ctaContent} />
      
      {/* Footer */}
      <Footer />
    </>
  );
};

export default PremiumHome;