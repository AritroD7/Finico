import React, { useState, useEffect, useRef } from 'react';
import '../styles/interactivity.css';
import { Icon } from './Icons';

/**
 * AnimatedTestimonials component
 * Displays customer testimonials in an engaging, animated carousel
 */
const AnimatedTestimonials = ({ testimonials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const autoplayRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  // Reset autoplay timer when index changes
  useEffect(() => {
    if (isAutoplay) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = setTimeout(() => {
        goToNext();
      }, 5000); // Change testimonial every 5 seconds
    }
    
    return () => clearTimeout(autoplayRef.current);
  }, [currentIndex, isAutoplay]);
  
  // Pause autoplay when user interacts
  const pauseAutoplay = () => {
    setIsAutoplay(false);
    clearTimeout(autoplayRef.current);
  };
  
  // Resume autoplay after user interaction
  const resumeAutoplay = () => {
    setIsAutoplay(true);
  };
  
  // Navigation functions
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };
  
  const goToIndex = (index) => {
    setCurrentIndex(index);
  };
  
  // Generate star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Icon 
        key={i}
        name="star" 
        className={`h-4 w-4 ${i < rating ? 'text-amber-400' : 'text-slate-300'}`}
      />
    ));
  };
  
  // Add intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsAutoplay(true);
        } else {
          setIsAutoplay(false);
        }
      },
      { threshold: 0.3 }
    );
    
    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
    }
    
    return () => {
      if (testimonialsRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  return (
    <div 
      ref={testimonialsRef}
      className="bg-white py-16"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">What Our Users Say</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover how Finico is helping people achieve their financial goals
          </p>
        </div>
        
        {/* Testimonials carousel */}
        <div 
          className="relative perspective-container"
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
        >
          {/* Card container with 3D effect */}
          <div 
            className="glass-effect relative mx-auto max-w-3xl rounded-2xl p-8 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 text-indigo-400 opacity-30">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30V60H20V40H10C10 28.96 18.96 20 30 20V0C13.44 0 0 13.44 0 30ZM40 0V20C51.04 20 60 28.96 60 40H50V60H70V30C70 13.44 56.56 0 40 0Z"/>
              </svg>
            </div>
            
            {/* Testimonial content */}
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div 
                className="mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md"
                style={{ 
                  transform: 'translateZ(20px)',
                  transition: 'all 0.5s ease'
                }}
              >
                <img 
                  src={testimonials[currentIndex]?.avatar || 'https://via.placeholder.com/100'} 
                  alt={testimonials[currentIndex]?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Rating */}
              <div 
                className="mb-4 flex"
                style={{ transform: 'translateZ(10px)' }}
              >
                {renderStars(testimonials[currentIndex]?.rating || 5)}
              </div>
              
              {/* Quote */}
              <div 
                className="mb-6 text-lg text-slate-700 fade-in" 
                style={{ 
                  transform: 'translateZ(15px)',
                  minHeight: '100px' 
                }}
              >
                "{testimonials[currentIndex]?.quote}"
              </div>
              
              {/* Name and title */}
              <div style={{ transform: 'translateZ(5px)' }}>
                <h4 className="text-lg font-semibold text-slate-900">
                  {testimonials[currentIndex]?.name}
                </h4>
                <p className="text-sm text-slate-500">
                  {testimonials[currentIndex]?.title}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="absolute top-1/2 left-0 right-0 -mt-6 flex justify-between px-4">
            <button 
              onClick={goToPrev}
              className="rounded-full bg-white p-2 shadow-md transition-transform hover:scale-110"
              aria-label="Previous testimonial"
            >
              <Icon name="chevronLeft" className="h-5 w-5 text-slate-700" />
            </button>
            
            <button 
              onClick={goToNext}
              className="rounded-full bg-white p-2 shadow-md transition-transform hover:scale-110"
              aria-label="Next testimonial"
            >
              <Icon name="chevronRight" className="h-5 w-5 text-slate-700" />
            </button>
          </div>
          
          {/* Indicators */}
          <div className="mt-8 flex justify-center space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToIndex(idx)}
                className={`h-2 w-8 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-indigo-500' : 'bg-slate-300'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;