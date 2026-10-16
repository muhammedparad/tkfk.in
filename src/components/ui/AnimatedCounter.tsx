'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            
            const startTimestamp = performance.now();
            const startValue = 0;
            const endValue = value;

            const step = (now: number) => {
              const elapsed = now - startTimestamp;
              const progress = Math.min(elapsed / durationMs, 1);
              
              // Easing curve: easeOutExpo for crisp, premium feel
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = startValue + (endValue - startValue) * easeProgress;
              
              setDisplayValue(current);

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setDisplayValue(endValue);
              }
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.2 }
    );

    const currentElem = elementRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, [value, durationMs]);

  const displayValueRef = useRef<number>(displayValue);
  displayValueRef.current = displayValue;

  // When value prop changes dynamically (e.g. switching platform tabs)
  useEffect(() => {
    if (hasAnimatedRef.current) {
      const startTimestamp = performance.now();
      const startValue = displayValueRef.current;
      const endValue = value;
      const stepDuration = 600;

      const step = (now: number) => {
        const elapsed = now - startTimestamp;
        const progress = Math.min(elapsed / stepDuration, 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = startValue + (endValue - startValue) * easeProgress;
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayValue(endValue);
        }
      };

      requestAnimationFrame(step);
    }
  }, [value]);

  const formattedNumber = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};
