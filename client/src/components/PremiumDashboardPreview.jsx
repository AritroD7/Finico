import React, { useRef, useEffect, useState } from 'react';
import '../styles/premium.css';

/**
 * PremiumDashboardPreview component
 * A visually impressive preview of the financial dashboard with advanced visual effects
 */
const PremiumDashboardPreview = ({ data }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle visibility with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    
    setMousePosition({ x, y });
  };
  
  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };
  
  return (
    <section className="py-24 bg-gradient-to-b from-surface-1 to-surface-2">
      <div className="container mx-auto px-6">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">
            Built for Clarity
          </span>
          <h2 className="mt-2 text-4xl font-bold text-neutral-800 leading-tight">
            Your Financial Command Center
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Our intuitive dashboard puts your entire financial picture in one place, with powerful insights and analytics.
          </p>
        </div>
        
        {/* Dashboard preview */}
        <div 
          ref={containerRef}
          className="relative perspective-container max-w-5xl mx-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background decorative elements */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary-100 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-accent-100 rounded-full opacity-50 blur-3xl"></div>
          
          {/* Main dashboard frame */}
          <div 
            className="rounded-2xl overflow-hidden border border-neutral-200 shadow-2xl bg-white chart-grid-bg"
            style={{
              transform: isVisible ? `rotateY(${mousePosition.x * 2}deg) rotateX(${-mousePosition.y * 2}deg)` : 'none',
              transition: 'transform 0.2s ease',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Dashboard header */}
            <div className="bg-surface-1 border-b border-neutral-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-neutral-800">Financial Dashboard</h3>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-1.5 rounded-md hover:bg-surface-2 text-neutral-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-1.5 rounded-md hover:bg-surface-2 text-neutral-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                  JD
                </div>
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="p-6 grid grid-cols-12 gap-6">
              {/* Summary cards row */}
              <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                {data.summaryCards.map((card, index) => (
                  <div 
                    key={index} 
                    className="bg-surface-1 rounded-xl p-4 border border-neutral-100 shadow-sm"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.6s ease ${0.1 + index * 0.1}s`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-500">{card.label}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.changeColor}`}>
                        {card.change}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-bold text-neutral-800">{card.value}</span>
                      {card.subValue && (
                        <span className="ml-2 text-sm text-neutral-500">{card.subValue}</span>
                      )}
                    </div>
                    {card.chart && (
                      <div className="mt-3 h-10">
                        {card.chart}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Main chart */}
              <div 
                className="col-span-12 lg:col-span-8 bg-surface-1 rounded-xl p-4 border border-neutral-100 shadow-sm"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.6s ease 0.5s'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-neutral-800">Portfolio Performance</h4>
                  <div className="flex items-center space-x-2">
                    <button className="px-2.5 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-md">1M</button>
                    <button className="px-2.5 py-1.5 text-neutral-600 text-xs font-medium rounded-md hover:bg-surface-2">3M</button>
                    <button className="px-2.5 py-1.5 text-neutral-600 text-xs font-medium rounded-md hover:bg-surface-2">6M</button>
                    <button className="px-2.5 py-1.5 text-neutral-600 text-xs font-medium rounded-md hover:bg-surface-2">1Y</button>
                    <button className="px-2.5 py-1.5 text-neutral-600 text-xs font-medium rounded-md hover:bg-surface-2">All</button>
                  </div>
                </div>
                
                <div className="h-64 relative">
                  {/* Chart SVG will be rendered here */}
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="400" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="200" x2="400" y2="200" stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Chart data */}
                    <path 
                      d="M0,150 C40,140 80,100 120,110 C160,120 200,90 240,70 C280,50 320,30 400,20" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={isVisible ? "none" : "400"}
                      strokeDashoffset={isVisible ? "0" : "400"}
                      style={{
                        transition: "stroke-dashoffset 2s ease"
                      }}
                    />
                    
                    {/* Area fill */}
                    <path 
                      d="M0,150 C40,140 80,100 120,110 C160,120 200,90 240,70 C280,50 320,30 400,20 L400,200 L0,200 Z" 
                      fill="url(#gradient)"
                      opacity={isVisible ? "0.1" : "0"}
                      style={{
                        transition: "opacity 2s ease"
                      }}
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Data points */}
                    {isVisible && [
                      { x: 0, y: 150 },
                      { x: 40, y: 140 },
                      { x: 80, y: 100 },
                      { x: 120, y: 110 },
                      { x: 160, y: 120 },
                      { x: 200, y: 90 },
                      { x: 240, y: 70 },
                      { x: 280, y: 50 },
                      { x: 320, y: 30 },
                      { x: 400, y: 20 }
                    ].map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="white"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transition: `opacity 0.5s ease ${0.5 + i * 0.1}s`
                        }}
                      />
                    ))}
                  </svg>
                </div>
              </div>
              
              {/* Side panels */}
              <div 
                className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: 'all 0.6s ease 0.6s'
                }}
              >
                {/* Asset allocation */}
                <div className="bg-surface-1 rounded-xl p-4 border border-neutral-100 shadow-sm">
                  <h4 className="font-medium text-neutral-800 mb-4">Asset Allocation</h4>
                  
                  <div className="flex justify-center mb-4">
                    <div className="relative h-32 w-32">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="50" cy="50" r="45" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="10"
                        />
                        
                        {/* Donut segments */}
                        {data.assetAllocation.map((asset, index) => {
                          const segmentLength = asset.percentage * 2.83; // 283 is approximately 2*PI*45
                          const prevSegments = data.assetAllocation
                            .slice(0, index)
                            .reduce((sum, a) => sum + a.percentage, 0) * 2.83;
                          
                          return (
                            <circle
                              key={index}
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={asset.color}
                              strokeWidth="10"
                              strokeDasharray={`${segmentLength} ${283 - segmentLength}`}
                              strokeDashoffset={-prevSegments}
                              style={{
                                opacity: isVisible ? 1 : 0,
                                transition: `opacity 0.6s ease ${0.7 + index * 0.1}s`
                              }}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {data.assetAllocation.map((asset, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: asset.color }}
                          ></span>
                          <span className="text-neutral-700">{asset.name}</span>
                        </div>
                        <span className="font-medium text-neutral-800">{asset.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent transactions */}
                <div className="bg-surface-1 rounded-xl p-4 border border-neutral-100 shadow-sm">
                  <h4 className="font-medium text-neutral-800 mb-3">Recent Transactions</h4>
                  
                  <div className="space-y-3">
                    {data.recentTransactions.map((transaction, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-2 rounded-lg hover:bg-surface-2"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                          transition: `all 0.5s ease ${0.8 + index * 0.1}s`
                        }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${transaction.iconBg}`}>
                          {transaction.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-neutral-800">{transaction.name}</span>
                            <span className={`font-medium text-sm ${transaction.amountColor}`}>
                              {transaction.amount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-neutral-500">{transaction.date}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-3 text-neutral-600">{transaction.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating action button */}
          <div 
            className="absolute -bottom-5 right-8"
            style={{
              transform: `translateZ(40px) translateY(${isVisible ? '0' : '20px'})`,
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.6s ease 1s'
            }}
          >
            <button className="h-14 w-14 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Notification badge */}
          <div 
            className="absolute -top-4 right-8"
            style={{
              transform: `translateZ(30px) translateY(${isVisible ? '0' : '-20px'})`,
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.6s ease 1.2s'
            }}
          >
            <div className="px-4 py-2 bg-accent-500 text-white text-sm font-medium rounded-lg shadow-lg">
              Portfolio up 12.4% this month!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumDashboardPreview;