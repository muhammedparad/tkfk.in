'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextScrollRevealProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  startOpacity?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export const TextScrollReveal: React.FC<TextScrollRevealProps> = ({
  text,
  className = '',
  as: Component = 'p',
  startOpacity = 0.2,
  highlightWords = [],
  highlightClass = 'text-[#ff6b35]',
}) => {
  const containerRef = useRef<HTMLElement>(null);

  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wordSpans = el.querySelectorAll<HTMLSpanElement>('.kinetic-word');

    if (prefersReducedMotion) {
      wordSpans.forEach((span) => {
        span.style.opacity = '1';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordSpans,
        { opacity: startOpacity },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.15,
          duration: 1,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 50%',
            scrub: 0.6,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [startOpacity]);

  return (
    <Component
      ref={containerRef as any}
      className={`inline-block leading-relaxed ${className}`}
    >
      {words.map((word, idx) => {
        const isHighlight = highlightWords.some(
          (hw) => word.toLowerCase().includes(hw.toLowerCase())
        );

        return (
          <span
            key={idx}
            className={`kinetic-word inline-block transition-opacity duration-150 mr-[0.25em] ${
              isHighlight ? highlightClass : ''
            }`}
            style={{ opacity: startOpacity }}
          >
            {word}
          </span>
        );
      })}
    </Component>
  );
};
