import React, { useState, useEffect, useRef } from 'react';
import '../styles/premium.css';

/**
 * PremiumTestimonials component
 * An elegant, interactive testimonial slider with dynamic animations
 */
const PremiumTestimonials = ({ testimonials = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const testimonialRef = useRef(null);
  const autoPlayRef = useRef(null);
  const totalTestimonials = testimonials.length;
  
  // Set up IntersectionObserver to trigger animations when component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    
    if (testimonialRef.current) {
      observer.observe(testimonialRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Handle auto-rotation of testimonials
  useEffect(() => {
    if (!isVisible) return;
    
    const play = () => {
      setActiveIndex((prev) => (prev + 1) % totalTestimonials);
    };
    
    autoPlayRef.current = setInterval(play, 5000);
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isVisible, totalTestimonials]);
  
  // Navigate to a specific testimonial
  const goToTestimonial = (index) => {
    setActiveIndex(index);
    
    // Reset interval timer when manually changing testimonial
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % totalTestimonials);
      }, 5000);
    }
  };
  
  // Go to previous testimonial
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
  };
  
  // Go to next testimonial
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % totalTestimonials);
  };
  
  if (!testimonials.length) return null;
  
  return (
    <section className="bg-gradient-to-b from-surface-2 to-surface-1 py-24" ref={testimonialRef}>
      <div className="container mx-auto px-6">
        {/* Section heading */}
        <div 
          className="text-center max-w-3xl mx-auto mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease'
          }}
        >
          <span className="text-sm font-medium text-accent-600 uppercase tracking-wider">
            Success Stories
          </span>
          <h2 className="mt-2 text-4xl font-bold text-neutral-800 leading-tight">
            Trusted by Thousands
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Hear from our community of users who transformed their financial lives with Finico
          </p>
        </div>
        
        {/* Testimonial carousel */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-100 rounded-full opacity-50 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-100 rounded-full opacity-50 blur-3xl translate-x-1/4 translate-y-1/4"></div>
          
          {/* Quote marks */}
          <div 
            className="absolute -top-16 left-0 text-9xl text-primary-100 font-serif leading-none"
            style={{
              opacity: isVisible ? 0.8 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s ease 0.2s'
            }}
          >
            "
          </div>
          
          <div 
            className="absolute -bottom-40 right-0 text-9xl text-primary-100 font-serif leading-none"
            style={{
              opacity: isVisible ? 0.8 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.8s ease 0.2s'
            }}
          >
            "
          </div>
          
          {/* Main testimonial card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden relative">
            <div className="p-8 md:p-12 md:grid md:grid-cols-5 gap-10 items-center">
              {/* Testimonial image */}
              <div className="md:col-span-2 mb-8 md:mb-0 flex justify-center">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={index}
                    className="relative h-64 w-64"
                    style={{
                      opacity: activeIndex === index ? 1 : 0,
                      position: 'absolute',
                      transition: 'opacity 0.5s ease',
                    }}
                  >
                    <div
                      className="premium-card-gradient rounded-2xl h-full w-full overflow-hidden flex items-center justify-center"
                      style={{
                        transform: activeIndex === index && isVisible
                          ? 'scale(1) rotate(0)'
                          : 'scale(0.8) rotate(-5deg)',
                        transition: 'transform 0.6s ease',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-6xl font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      
                      {/* Decorative dot pattern */}
                      <div className="absolute -bottom-10 -left-10 h-24 w-24 pattern-dots opacity-10"></div>
                      <div className="absolute -top-10 -right-10 h-24 w-24 pattern-dots opacity-10"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Testimonial content */}
              <div className="md:col-span-3">
                <div className="relative h-full">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="relative"
                      style={{
                        opacity: activeIndex === index ? 1 : 0,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        transform: activeIndex === index && isVisible
                          ? 'translateX(0)'
                          : activeIndex > index 
                            ? 'translateX(-100px)'
                            : 'translateX(100px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease'
                      }}
                    >
                      <div className="flex mb-6 items-center">
                        {/* Star rating */}
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-yellow-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                                transition: `opacity 0.5s ease ${0.3 + i * 0.1}s, transform 0.5s ease ${0.3 + i * 0.1}s`
                              }}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      
                      <blockquote
                        className="text-2xl text-neutral-700 font-medium italic leading-relaxed mb-6"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                          transition: 'all 0.6s ease 0.5s'
                        }}
                      >
                        "{testimonial.quote}"
                      </blockquote>
                      
                      <div className="flex items-center">
                        <div>
                          <h4 className="font-bold text-lg text-neutral-800">{testimonial.name}</h4>
                          <p className="text-neutral-500">{testimonial.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Navigation controls */}
            <div className="px-8 pb-8 flex justify-between items-center">
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeIndex === index ? 'w-8 bg-primary-600' : 'w-2 bg-neutral-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={prevTestimonial}
                  className="h-10 w-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-surface-2 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={nextTestimonial}
                  className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonials;