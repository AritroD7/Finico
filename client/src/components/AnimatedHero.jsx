import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/interactivity.css';

/**
 * AnimatedHero component
 * A visually appealing hero section with animations and interactive elements
 */
const AnimatedHero = ({ 
  title = "Take control of your financial future", 
  subtitle = "Powerful tools to plan, forecast, and optimize your personal finances",
  primaryCTA = { text: "Get Started", link: "/login" },
  secondaryCTA = { text: "Learn More", link: "/about" },
  showParticles = true
}) => {
  const heroRef = useRef(null);
  const particlesRef = useRef(null);
  
  // Create and animate particles
  useEffect(() => {
    if (!showParticles || !particlesRef.current) return;
    
    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (heroRef.current) {
        canvas.width = heroRef.current.offsetWidth;
        canvas.height = heroRef.current.offsetHeight;
      }
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create particles
    const particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000); // Adjust density
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25
      });
    }
    
    // Animation loop
    let animationFrame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, [showParticles]);
  
  return (
    <div 
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 py-16 text-white bg-animate"
    >
      {/* Particle background */}
      {showParticles && (
        <canvas 
          ref={particlesRef} 
          className="absolute inset-0 h-full w-full"
          style={{ opacity: 0.4 }}
        />
      )}
      
      {/* Content container */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Animated title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl fade-in">
            {title}
          </h1>
          
          {/* Subtitle */}
          <p className="mb-8 text-lg text-white/90 md:text-xl fade-in" style={{ animationDelay: '0.2s' }}>
            {subtitle}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 fade-in" style={{ animationDelay: '0.4s' }}>
            <Link 
              to={primaryCTA.link} 
              className="btn-interactive rounded-xl bg-white px-6 py-3 font-medium text-indigo-600 shadow-lg hover:bg-white/95 transition-all"
            >
              {primaryCTA.text}
            </Link>
            
            <Link 
              to={secondaryCTA.link} 
              className="btn-interactive rounded-xl bg-white/20 px-6 py-3 font-medium text-white hover:bg-white/30 transition-all"
            >
              {secondaryCTA.text}
            </Link>
          </div>
          
          {/* Floating element decoration */}
          <div className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-white/10 blur-3xl" 
               style={{ animation: 'floatSlow 8s ease-in-out infinite' }}></div>
          <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rounded-full bg-sky-300/20 blur-3xl" 
               style={{ animation: 'floatSlow 6s ease-in-out infinite 1s' }}></div>
        </div>
      </div>
      
      {/* Wave divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-16 w-full">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            fill="#FFFFFF"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            fill="#FFFFFF"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            fill="#FFFFFF"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedHero;