import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/premium.css';

/**
 * PremiumFeatures component
 * Elegant feature showcase with 3D card effects and interactive elements
 */
const PremiumFeatures = ({ features }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  
  // Handle visibility with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Auto-rotate features
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isVisible, features.length]);
  
  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-surface-2"
    >
      <div className="container mx-auto px-6">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">
            Powerful Capabilities
          </span>
          <h2 className="mt-2 text-4xl font-bold text-neutral-800 leading-tight">
            Transform Your Financial <span className="text-gradient">Decision-Making</span>
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Our suite of financial tools gives you unprecedented clarity and control over your finances.
          </p>
        </div>
        
        {/* Main feature showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Feature navigation sidebar */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="space-y-3 stagger-fade-in">
              {features.map((feature, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-5 rounded-xl transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-surface-1 shadow-md border border-primary-100' 
                      : 'hover:bg-surface-1'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start">
                    <div 
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeFeature === index
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-3 text-primary-600'
                      }`}
                    >
                      {feature.icon}
                    </div>
                    
                    <div className="ml-4">
                      <h3 className={`font-medium ${
                        activeFeature === index ? 'text-primary-700' : 'text-neutral-800'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`mt-1 text-sm ${
                        activeFeature === index ? 'text-neutral-600' : 'text-neutral-500'
                      }`}>
                        {feature.shortDescription}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-8 text-center lg:text-left fade-in" style={{ animationDelay: "0.6s" }}>
              <Link 
                to="/features" 
                className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
              >
                Explore all features
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Feature display area */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="perspective-container">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`transition-all duration-700 ${
                    activeFeature === index 
                      ? 'opacity-100 transform-none' 
                      : 'opacity-0 absolute inset-0 transform translate-x-8'
                  }`}
                  style={{ 
                    display: activeFeature === index ? 'block' : 'none' 
                  }}
                >
                  <div 
                    className="premium-card rounded-2xl overflow-hidden bg-white border border-neutral-200"
                  >
                    {/* Feature visualization */}
                    <div className="aspect-video relative">
                      {feature.visual}
                      
                      {/* Feature badge */}
                      <div className="absolute top-4 right-4 py-1.5 px-3 bg-surface-1 glass rounded-full text-xs font-medium text-primary-700 border border-primary-100">
                        {feature.badge}
                      </div>
                    </div>
                    
                    {/* Feature content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-neutral-800 mb-3">
                        {feature.title}
                      </h3>
                      
                      <p className="text-neutral-600 mb-6">
                        {feature.fullDescription}
                      </p>
                      
                      {/* Feature highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {feature.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start">
                            <div className="flex-shrink-0 mt-1 text-primary-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3 text-sm text-neutral-700">
                              {highlight}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Link 
                        to={feature.linkPath} 
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-lg transition-colors"
                      >
                        {feature.linkText}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;