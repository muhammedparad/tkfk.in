'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // e.g. -20 to 20 percent or px
  direction?: 'vertical' | 'horizontal';
  scaleEffect?: boolean;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  className = '',
  speed = 15,
  direction = 'vertical',
  scaleEffect = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = targetRef.current;
    const trigger = containerRef.current;

    if (!target || !trigger || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const vars: gsap.TweenVars = {
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      };

      if (direction === 'vertical') {
        vars.y = -speed * 2;
      } else {
        vars.x = -speed * 2;
      }

      if (scaleEffect) {
        vars.scale = 1.0;
        gsap.set(target, { scale: 1.04 });
      }

      gsap.to(target, vars);
    }, trigger);

    return () => ctx.revert();
  }, [speed, direction, scaleEffect]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={targetRef} className="will-change-transform h-full w-full">
        {children}
      </div>
    </div>
  );
};
