import React, { useEffect, useRef, useState } from 'react';
import '../styles/interactivity.css';

/**
 * AnimatedDataChart component
 * Displays financial data with animated transitions and hover effects
 */
const AnimatedDataChart = ({ 
  data = [], 
  title = "Financial Overview", 
  height = 250,
  showLegend = true,
  type = 'bar' // 'bar', 'line', 'pie'
}) => {
  const chartRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Colors from our brand palette
  const colors = [
    'rgb(129, 140, 248)', // indigo-400
    'rgb(165, 180, 252)', // indigo-300
    'rgb(147, 197, 253)', // sky-300
    'rgb(56, 189, 248)',  // sky-400
    'rgb(96, 165, 250)'   // blue-400
  ];
  
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(item => item.value));
  
  useEffect(() => {
    // Intersection observer to trigger animation when chart comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    if (chartRef.current) {
      observer.observe(chartRef.current);
    }
    
    return () => {
      if (chartRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  // Render different chart types
  const renderChart = () => {
    switch(type) {
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };
  
  // Bar chart rendering
  const renderBarChart = () => {
    return (
      <div className="flex h-full items-end justify-between space-x-2 pt-6">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          const delay = index * 0.1;
          
          return (
            <div 
              key={index}
              className="group relative flex flex-col items-center"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div 
                className="w-16 rounded-t-md transition-all duration-500 ease-out"
                style={{
                  height: isVisible ? `${barHeight}%` : '0%',
                  backgroundColor: colors[index % colors.length],
                  transitionDelay: `${delay}s`,
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.5
                }}
              ></div>
              
              <span className="mt-2 text-xs text-slate-600">{item.label}</span>
              
              {/* Value tooltip */}
              <div 
                className="absolute bottom-full mb-2 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                style={{ transform: 'translateX(-50%)' }}
              >
                {item.value.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Line chart rendering
  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="h-full w-full pt-6">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray={isVisible ? "0" : "1000"}
            strokeDashoffset={isVisible ? "0" : "1000"}
            style={{
              transition: "stroke-dashoffset 2s ease-out"
            }}
          />
          
          {/* Area under the line */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#areaGradient)"
            opacity={isVisible ? "0.3" : "0"}
            style={{
              transition: "opacity 2s ease-out"
            }}
          />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(129, 140, 248)" />
              <stop offset="100%" stopColor="rgb(56, 189, 248)" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(129, 140, 248)" />
              <stop offset="100%" stopColor="rgb(129, 140, 248, 0)" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  fill="white"
                  stroke="rgb(129, 140, 248)"
                  strokeWidth="1"
                  opacity={isVisible ? 1 : 0}
                  style={{
                    transition: `opacity 2s ease-out ${index * 0.1}s`
                  }}
                />
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="mt-2 flex justify-between">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-slate-600">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Pie chart rendering
  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="flex h-full items-center justify-center">
        <svg width="80%" height="80%" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            
            // Calculate the SVG arc path
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            // Convert to radians
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            // Calculate points
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);
            
            // Create path
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');
            
            const result = (
              <g key={index}>
                <path
                  d={pathData}
                  fill={colors[index % colors.length]}
                  opacity={isVisible ? (activeIndex === index ? 1 : 0.9) : 0}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  style={{
                    transition: `opacity 0.5s ease-out ${index * 0.1}s`,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: '50px 50px'
                  }}
                >
                  <title>{`${item.label}: ${item.value} (${(percentage * 100).toFixed(1)}%)`}</title>
                </path>
              </g>
            );
            
            currentAngle += angle;
            return result;
          })}
          
          {/* Center circle for donut style */}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
        
        {/* Legend */}
        {showLegend && (
          <div className="ml-4 flex flex-col space-y-2">
            {data.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center text-sm" 
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div 
                  className="mr-2 h-3 w-3 rounded-sm"
                  style={{ 
                    backgroundColor: colors[index % colors.length],
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.5
                  }}
                ></div>
                <span className="text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div 
      ref={chartRef}
      className="w-full rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
      style={{ height: `${height}px` }}
    >
      <h3 className="mb-2 text-sm font-medium text-slate-700">{title}</h3>
      {renderChart()}
    </div>
  );
};

export default AnimatedDataChart;