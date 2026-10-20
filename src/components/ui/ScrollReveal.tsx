'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  durationMs?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  durationMs = 800,
}) => {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
      return;
    }

    let x = 0;
    let y = 0;
    switch (direction) {
      case 'up':
        y = 35;
        break;
      case 'down':
        y = -35;
        break;
      case 'left':
        x = 35;
        break;
      case 'right':
        x = -35;
        break;
      case 'none':
        break;
    }

    gsap.set(el, {
      opacity: 0,
      x,
      y,
      force3D: true,
    });

    const ctx = gsap.context(() => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: durationMs / 1000,
        delay: delayMs / 1000,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [direction, delayMs, durationMs]);

  return (
    <div ref={domRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};
