'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GsapRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  scale?: number;
  overflowHidden?: boolean;
}

export const GsapReveal: React.FC<GsapRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 1.1,
  yOffset = 35,
  scale = 0.98,
  overflowHidden = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = innerRef.current || containerRef.current;
    if (!target) return;

    if (prefersReducedMotion) {
      gsap.set(target, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(target, {
      opacity: 0,
      y: yOffset,
      scale: scale,
      transformOrigin: 'center center',
      force3D: true,
    });

    const ctx = gsap.context(() => {
      gsap.to(target, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 88%',
          once: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [delay, duration, yOffset, scale]);

  if (overflowHidden) {
    return (
      <div ref={containerRef} className={`overflow-hidden ${className}`}>
        <div ref={innerRef} className="will-change-transform">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
};
