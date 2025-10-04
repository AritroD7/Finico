import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/premium.css';

/**
 * PremiumHero component
 * A sophisticated hero section with advanced visual effects and animations
 */
const PremiumHero = () => {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Create and animate the particle network effect
  useEffect(() => {
    if (!canvasRef.current || !heroRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let width, height;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      width = heroRef.current.offsetWidth;
      height = heroRef.current.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Particle system
    const particlesArray = [];
    const numberOfParticles = Math.min(width * height / 9000, 100);
    
    // Connection line settings
    const maxDistance = 200;
    const connectionOpacity = 0.15;
    
    // Create particles
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 2 + 0.5;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const directionX = Math.random() * 0.4 - 0.2;
      const directionY = Math.random() * 0.4 - 0.2;
      const color = 'rgba(255, 255, 255, 0.8)';
      
      particlesArray.push({
        x, y, directionX, directionY, size, color
      });
    }
    
    // Draw and update particles
    const updateParticles = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw connection lines first
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * connectionOpacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw and update each particle
      for (let i = 0; i < particlesArray.length; i++) {
        const p = particlesArray[i];
        
        // Draw particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position
        p.x += p.directionX;
        p.y += p.directionY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > width) p.directionX *= -1;
        if (p.y < 0 || p.y > height) p.directionY *= -1;
      }
    };
    
    // Animation loop
    const animate = () => {
      updateParticles();
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);
  
  return (
    <section 
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-premium min-h-[90vh] flex items-center py-16"
    >
      {/* Particle network effect */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 h-full w-full opacity-40"
      />
      
      {/* Decorative elements */}
      <div className="absolute top-[10%] right-[20%] w-64 h-64 rounded-full bg-primary-400 opacity-10 blur-3xl" />
      <div className="absolute bottom-[20%] left-[10%] w-72 h-72 rounded-full bg-primary-700 opacity-10 blur-3xl" />
      
      {/* Main content */}
      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center">
        {/* Text content */}
        <div className="lg:w-1/2 text-white mb-16 lg:mb-0">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-white/90 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 bg-accent-400 rounded-full mr-2 pulse-soft"></span>
            Introducing the next generation of financial planning
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="opacity-0 animate-fadeIn" style={{animationDelay: "0.2s", animationFillMode: "forwards"}}>
              Shape Your Financial
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-primary-200 opacity-0 animate-fadeIn" style={{animationDelay: "0.5s", animationFillMode: "forwards"}}>
              Future With Precision
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-lg opacity-0 animate-fadeIn" style={{animationDelay: "0.8s", animationFillMode: "forwards"}}>
            Leverage AI-powered insights and interactive tools to visualize, plan, and optimize every aspect of your financial journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fadeIn" style={{animationDelay: "1.1s", animationFillMode: "forwards"}}>
            <Link 
              to="/signup" 
              className="btn-premium btn-premium-primary shine-effect"
            >
              Start Free Trial
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            
            <Link 
              to="/demo" 
              className="btn-premium btn-premium-secondary"
            >
              Watch Demo
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="mt-8 flex items-center gap-4 opacity-0 animate-fadeIn" style={{animationDelay: "1.4s", animationFillMode: "forwards"}}>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img 
                  key={i}
                  src={`https://randomuser.me/api/portraits/men/${20 + i}.jpg`} 
                  alt="User" 
                  className="w-8 h-8 rounded-full border-2 border-primary-700"
                />
              ))}
            </div>
            <span className="text-sm text-white/80">Join 25,000+ financial planners</span>
          </div>
        </div>
        
        {/* 3D dashboard mockup */}
        <div className="lg:w-1/2 perspective-container opacity-0 animate-fadeIn" style={{animationDelay: "1s", animationFillMode: "forwards"}}>
          <div 
            className="relative transform lg:rotate-y-12 lg:rotate-x-12 transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Main dashboard mockup */}
            <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="p-4 bg-gradient-to-b from-white/20 to-transparent border-b border-white/10">
                <div className="flex items-center">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto text-sm text-white/70">Financial Dashboard</div>
                </div>
              </div>
              <img 
                src="https://uxwing.com/wp-content/themes/uxwing/download/web-app-development/dashboard-icon.png" 
                alt="Financial Dashboard" 
                className="w-full"
                style={{ transform: 'translateZ(20px)' }}
              />
            </div>
            
            {/* Floating elements */}
            <div 
              className="absolute -right-12 -bottom-10 glass p-4 rounded-xl shadow-lg border border-white/20 float-slow"
              style={{ transform: 'translateZ(40px)' }}
            >
              <div className="w-40">
                <div className="text-xs text-white/70 mb-1">Net Worth Growth</div>
                <div className="flex items-end gap-1 h-14">
                  {[30, 45, 25, 55, 70, 60, 75].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t-sm" 
                      style={{
                        height: `${h}%`,
                        background: `rgba(${100 + i * 20}, ${150 + i * 10}, 255, 0.7)`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div 
              className="absolute -left-8 -top-12 glass p-3 rounded-lg shadow-lg border border-white/20 float-reverse"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-400 rounded-full flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-white/70">Current Balance</div>
                  <div className="text-sm text-white font-medium">$124,500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,144C672,117,768,75,864,74.7C960,75,1056,117,1152,133.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default PremiumHero;