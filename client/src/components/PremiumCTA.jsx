import React, { useEffect, useRef, useState } from 'react';
import '../styles/premium.css';

/**
 * PremiumCTA component
 * A visually stunning call-to-action section with animated background and interactive elements
 */
const PremiumCTA = ({ title, description, primaryAction, secondaryAction }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Setup canvas animation when component is visible
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
  
  // Initialize and animate the particle background
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Set canvas size
    const setCanvasSize = () => {
      if (!containerRef.current) return;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Create particles
    const createParticles = () => {
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
    };
    
    // Connect particles with lines
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      connectParticles();
      requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [isVisible]);
  
  return (
    <section 
      ref={containerRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-accent-900">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        ></canvas>
        
        {/* Gradient overlays */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-primary-900 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary-900 to-transparent opacity-70"></div>
      </div>
      
      {/* Content container */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main heading */}
          <h2 
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease'
            }}
          >
            {title || "Ready to Transform Your Financial Future?"}
          </h2>
          
          {/* Description text */}
          <p 
            className="mt-6 text-lg md:text-xl text-primary-100 max-w-2xl mx-auto"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease 0.2s'
            }}
          >
            {description || "Join thousands of users who have taken control of their finances and achieved their goals with our powerful platform."}
          </p>
          
          {/* Action buttons */}
          <div 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease 0.4s'
            }}
          >
            {/* Primary action button with hover effect */}
            <button
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="relative overflow-hidden px-8 py-4 bg-white text-primary-900 font-medium text-lg rounded-xl shadow-xl group"
              style={{
                transition: 'all 0.3s ease'
              }}
            >
              {/* Button content */}
              <span className="relative z-10">
                {primaryAction?.label || "Get Started for Free"}
              </span>
              
              {/* Button background animation */}
              <span 
                className="absolute inset-0 bg-gradient-to-r from-primary-300 to-accent-300"
                style={{
                  opacity: isHovering ? 1 : 0,
                  transform: `scale(${isHovering ? 1 : 1.5})`,
                  transition: 'all 0.4s ease'
                }}
              ></span>
              
              {/* Animated arrow */}
              <span 
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{
                  transform: isHovering 
                    ? 'translate(0, -50%)' 
                    : 'translate(-10px, -50%)',
                  opacity: isHovering ? 1 : 0,
                  transition: 'all 0.3s ease'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
            
            {/* Secondary action button */}
            {secondaryAction && (
              <button className="px-8 py-4 text-white font-medium text-lg border border-white/30 rounded-xl hover:bg-white/10 transition-colors">
                {secondaryAction.label || "Learn More"}
              </button>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div 
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-primary-500 opacity-20 blur-3xl"
          style={{
            opacity: isVisible ? 0.2 : 0,
            transition: 'opacity 1s ease 0.5s'
          }}
        ></div>
        
        <div 
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-accent-500 opacity-20 blur-3xl"
          style={{
            opacity: isVisible ? 0.2 : 0,
            transition: 'opacity 1s ease 0.7s'
          }}
        ></div>
        
        {/* Trust badges */}
        <div 
          className="mt-16 flex flex-wrap justify-center items-center gap-8"
          style={{
            opacity: isVisible ? 0.7 : 0,
            transition: 'opacity 0.8s ease 0.6s'
          }}
        >
          {/* Badge 1 */}
          <div className="flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>256-bit SSL Encryption</span>
          </div>
          
          {/* Badge 2 */}
          <div className="flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>SOC 2 Compliant</span>
          </div>
          
          {/* Badge 3 */}
          <div className="flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>24/7 Support</span>
          </div>
          
          {/* Badge 4 */}
          <div className="flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>30-Day Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTA;