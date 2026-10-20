'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

declare global {
  interface Window {
    __lenis?: Lenis;
    __gsap?: typeof gsap;
  }
}

export const SmoothScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize Lenis with refined, responsive easing (matching hapxdigital.com motion physics)
    const lenis = new Lenis({
      lerp: prefersReducedMotion ? 1 : 0.08, // 0.08 provides continuous, silky smooth control without sluggishness
      duration: prefersReducedMotion ? 0.01 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    window.__lenis = lenis;
    window.__gsap = gsap;

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis through GSAP's unified ticker to prevent duplicate RAF loops and micro-stutter
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0); // Eliminates lag spikes and jumpiness during heavy DOM events

    // Global interception of hash links for buttery smooth anchor navigation
    const handleGlobalAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      let targetId = '';
      if (href.startsWith('#') && href.length > 1) {
        targetId = href.slice(1);
      } else if (href.startsWith('/#') && href.length > 2 && window.location.pathname === '/') {
        targetId = href.slice(2);
      }

      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: -76, // Offset for sticky navbar
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          window.history.pushState(null, '', `/#${targetId}`);
        }
      }
    };

    document.addEventListener('click', handleGlobalAnchorClick, { capture: true });

    // Handle initial hash in URL on page load
    if (window.location.hash) {
      const initialId = window.location.hash.slice(1);
      setTimeout(() => {
        const initialEl = document.getElementById(initialId);
        if (initialEl) {
          lenis.scrollTo(initialEl, { offset: -76, immediate: false });
        }
      }, 300);
    }

    return () => {
      document.removeEventListener('click', handleGlobalAnchorClick, { capture: true });
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    };
  }, []);

  const scrollTo = (
    target: string | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    if (!lenisRef.current) return;
    lenisRef.current.scrollTo(target, {
      offset: options?.offset ?? -76,
      duration: options?.duration ?? 1.2,
      immediate: options?.immediate ?? false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
};
