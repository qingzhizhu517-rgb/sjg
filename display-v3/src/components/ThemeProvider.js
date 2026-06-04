'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const ThemeContext = createContext({
  theme: 'real',
  isReal: true,
  isAnime: false,
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('real');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const overlayRef = useRef(null);
  const blobRef = useRef(null);

  useEffect(() => {
    // Read theme from localStorage on mount
    const savedTheme = localStorage.getItem('sjg-theme') || 'real';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    setMounted(true);
  }, []);

  const toggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Wait for the overlay container to mount, then execute GSAP ink animation
    setTimeout(() => {
      if (!blobRef.current || !overlayRef.current) {
        // Fallback if refs not bound
        const nextTheme = theme === 'real' ? 'inkwash' : 'real';
        setTheme(nextTheme);
        localStorage.setItem('sjg-theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        setIsTransitioning(false);
        return;
      }

      // 1. Initial State: Small blurred center ink droplet
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(blobRef.current, { scale: 0, opacity: 0.98, filter: 'blur(35px)' });

      // 2. Animate: Expand ink splash to cover viewport
      gsap.to(blobRef.current, {
        scale: 1,
        duration: 0.6,
        ease: 'power3.in',
        onComplete: () => {
          // 3. Switch theme under the ink cover
          const nextTheme = theme === 'real' ? 'inkwash' : 'real';
          setTheme(nextTheme);
          localStorage.setItem('sjg-theme', nextTheme);
          document.documentElement.setAttribute('data-theme', nextTheme);

          // 4. Fade out overlay to reveal new design system
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              setIsTransitioning(false);
            }
          });
        }
      });
    }, 30);
  };

  const isReal = theme === 'real';
  const isAnime = theme === 'inkwash';

  // Prevent flash or hydration mismatch during SSR
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'real', isReal: true, isAnime: false, toggle }}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, isReal, isAnime, toggle }}>
      {children}
      
      {/* Immersive Ink Splash transition overlay */}
      {isTransitioning && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-transparent pointer-events-none overflow-hidden"
        >
          <div
            ref={blobRef}
            className="w-[180vmax] h-[180vmax] rounded-full bg-[#1b1917] origin-center"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
