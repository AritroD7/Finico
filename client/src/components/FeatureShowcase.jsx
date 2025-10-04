import React, { useRef, useEffect, useState } from 'react';
import { Icon } from './Icons';
import '../styles/interactivity.css';

/**
 * FeatureShowcase component
 * Displays product features in an interactive and animated layout
 */
const FeatureShowcase = ({ features = [] }) => {
  const showcaseRef = useRef(null);
  const [visibleFeatures, setVisibleFeatures] = useState([]);
  
  useEffect(() => {
    // Set up intersection observer to trigger animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleFeatures(prev => 
              [...new Set([...prev, ...features.map((_, i) => i)])]
            );
            
            // Once all are visible, disconnect
            if (visibleFeatures.length === features.length) {
              observer.disconnect();
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    
    if (showcaseRef.current) {
      observer.observe(showcaseRef.current);
    }
    
    return () => {
      if (showcaseRef.current) {
        observer.disconnect();
      }
    };
  }, [features, visibleFeatures.length]);
  
  return (
    <div 
      ref={showcaseRef}
      className="py-16 bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Powerful Financial Tools</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Take control of your finances with our comprehensive suite of tools designed to help you plan, track, and optimize your financial life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all duration-700 transform ${
                visibleFeatures.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                transitionDelay: `${index * 0.1}s`,
                perspective: '1000px'
              }}
            >
              {/* Icon */}
              <div 
                className="flex justify-center items-center w-16 h-16 rounded-full mb-6 mx-auto"
                style={{ 
                  background: `linear-gradient(135deg, ${feature.colorFrom || 'rgb(129, 140, 248)'}, ${feature.colorTo || 'rgb(96, 165, 250)'})`
                }}
              >
                <Icon 
                  name={feature.icon} 
                  className="h-8 w-8 text-white" 
                  style={{ 
                    animation: visibleFeatures.includes(index) 
                      ? 'floatSlow 3s ease-in-out infinite' 
                      : 'none' 
                  }}
                />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-center text-slate-800 mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-slate-600 text-center mb-6">
                {feature.description}
              </p>
              
              {/* Example/visualization */}
              {feature.visualization && (
                <div className="border-t border-slate-100 pt-4 mt-4">
                  {feature.visualization}
                </div>
              )}
              
              {/* Learn more button */}
              <div className="text-center">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center btn-interactive">
                  Learn more
                  <Icon name="arrowRight" className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;