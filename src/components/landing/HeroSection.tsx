'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { useParticipantSession } from '@/hooks/useParticipantSession';

// Authentic rotating headline states with matching pill colors and suffixes
const ROTATING_STATES = [
  {
    pill: 'creative ideas',
    pillBg: 'bg-[#fed8c7]',
    pillText: 'text-[#141412]',
    suffix: 'that build impact',
  },
  {
    pill: 'digital posters',
    pillBg: 'bg-[#ace1f8]',
    pillText: 'text-[#141412]',
    suffix: 'that inspire',
  },
  {
    pill: 'visual stories',
    pillBg: 'bg-[#fbe7a1]',
    pillText: 'text-[#141412]',
    suffix: 'that move minds',
  },
];

const TICKER_CARDS = [
  {
    iconBg: 'bg-[#fed8c7]', // Soft peach matching screenshot
    iconContent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#ff6b35]">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Community',
    time: '',
    detail: '& educators',
  },
  {
    iconBg: 'bg-[#ffc233]', // Amber / Gold matching screenshot
    iconContent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#141412]">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    title: 'Verified Recognition',
    time: '₹7,001 Award Pool',
    detail: 'Impartial jury review & official credentials',
  },
  {
    iconBg: 'bg-[#fed8c7]', // Soft peach matching screenshot
    iconContent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#ff6b35]">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Creative Growth',
    time: 'National Stage',
    detail: 'Kerala & all-India student cohorts',
  },
  {
    iconBg: 'bg-[#ff6b35]', // TKFK orange
    iconContent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Digital Poster Contest 2026',
    time: 'Flagship Event',
    detail: 'Registration open for school & college youth',
  },
  {
    iconBg: 'bg-[#ace1f8]', // Sky blue
    iconContent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#141412]">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Community Learning Circles',
    time: 'Knowledge Platform',
    detail: 'Creativity, youth development & design skills',
  },
];

export const HeroSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useParticipantSession();
  const [stateIndex, setStateIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setStateIndex((prev) => (prev + 1) % ROTATING_STATES.length);
        setIsFading(false);
      }, 260);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !heroRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-anim-item', {
        y: 28,
        opacity: 0,
        stagger: 0.1,
        duration: 1.1,
        ease: 'power3.out',
        clearProps: 'all',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const currentState = ROTATING_STATES[stateIndex];

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-transparent min-h-[calc(100dvh-64px)] flex flex-col justify-between pt-5 sm:pt-12 pb-3 sm:pb-8 border-b border-[#f0ede8]">
      
      {/* 
        ========================================================================
        Atmospheric Background Layer (Subtle Square Grid & Animated Accent Lines)
        ========================================================================
      */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        
        {/* Subtle Square Grid (Preserved stationary grid) */}
        <div className="absolute inset-0 hero-square-grid hero-edge-fade-mask" />

        {/* Soft Ambient Neutral Glow */}
        <div className="hero-ambient-glow" />

        {/* Moving Animated Accent Lines Layer (Desktop only to keep mobile pristine like reference) */}
        <div className="hidden sm:block absolute inset-0 hero-edge-fade-mask overflow-hidden pointer-events-none">
          {/* Vertical Lines */}
          {/* 1. Center Peach Accent Line with gliding beam */}
          <div className="hero-accent-line-center">
            <div className="hero-accent-beam" />
          </div>

          {/* 2. Left Vertical Restrained Charcoal Line */}
          <div className="hero-line-v-left">
            <div className="hero-tick-top-dark" />
          </div>

          {/* 3. Right Vertical Line with Soft Peach Accent */}
          <div className="hero-line-v-right">
            <div className="hero-tick-bottom-peach" />
          </div>

          {/* 4. Outer Vertical Slate Line (Desktop) */}
          <div className="hidden lg:block hero-line-v-outer" />

          {/* 8. Left Inner Vertical Line */}
          <div className="hero-line-v-left-inner" />

          {/* 9. Far Left Vertical Line (Desktop) */}
          <div className="hidden lg:block hero-line-v-far-left" />

          {/* 10. Far Right Vertical Line (Tablet/Desktop) */}
          <div className="hidden sm:block hero-line-v-far-right" />

          {/* 11. Right Inner Vertical Line */}
          <div className="hero-line-v-right-inner" />

          {/* Horizontal Lines */}
          {/* 5. Top Horizontal Charcoal Line */}
          <div className="hero-line-h-top" />

          {/* 6. Middle Horizontal Soft Peach Accent Line */}
          <div className="hero-line-h-mid" />

          {/* 7. Lower Horizontal Charcoal Line (Tablet/Desktop) */}
          <div className="hidden sm:block hero-line-h-bot" />

          {/* 12. Upper Horizontal Line */}
          <div className="hero-line-h-upper" />

          {/* 13. Sub-headline Horizontal Line */}
          <div className="hero-line-h-subhead" />

          {/* 14. CTA Area Horizontal Line (Tablet/Desktop) */}
          <div className="hidden sm:block hero-line-h-cta" />

          {/* 15. Ticker Top Horizontal Line (Desktop) */}
          <div className="hidden lg:block hero-line-h-ticker-top" />

          {/* Architectural Crosshair Plus Markers */}
          <div className="hero-crosshair" style={{ left: 'calc(50% - 144px)', top: '144px' }} />
          <div className="hero-crosshair hero-crosshair-peach" style={{ left: 'calc(50% + 144px)', top: '288px' }} />
          <div className="hero-crosshair" style={{ left: 'calc(50% - 48px)', top: '384px' }} />
          <div className="hidden sm:block hero-crosshair" style={{ left: 'calc(50% + 240px)', top: '480px' }} />
        </div>

      </div>

      {/* Main Center Content Container */}
      <div className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* Top Trust Indicator: 5 Black Stars + Trust Label */}
        <div className="hero-anim-item flex flex-col items-center justify-center space-y-1.5 mb-5 sm:mb-7 text-center">
          <div className="flex items-center gap-1 text-[#141412]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
            ))}
          </div>
          <p className="text-xs sm:text-sm font-normal text-[#141412] tracking-[-0.01em] max-w-[320px] sm:max-w-none leading-snug">
            The Knowledge Forum Kerala - Community for Creativity &amp; Youth Development
          </p>
        </div>

        {/* Hero Headline: Exact Multi-line Layout with Light Peach Pill */}
        <div className="hero-anim-item text-center max-w-4xl mx-auto">
          
          {/* Mobile View: Exact 4-Line Break Layout from Reference Screenshot */}
          <h1 className="flex sm:hidden flex-col items-center text-[40px] xs:text-[44px] font-bold text-[#141412] tracking-[-0.035em] leading-[1.08] mb-4">
            <span className="block">Turn what you</span>
            <span className="block">know into</span>
            
            {/* Peach Pill Badge matching reference */}
            <span className="my-1.5 inline-flex items-center justify-center">
              <span className={`inline-flex items-center justify-center ${currentState.pillBg} ${currentState.pillText} rounded-full px-6 py-0.5 transition-all duration-300 min-h-[46px] shadow-2xs`}>
                <span
                  className={`inline-block font-bold tracking-[-0.035em] whitespace-nowrap transition-all duration-260 ease-out ${
                    isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                  }`}
                >
                  {currentState.pill}
                </span>
              </span>
            </span>

            <span className="block">
              <span
                className={`inline-block transition-opacity duration-260 ${
                  isFading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {currentState.suffix}
              </span>
            </span>
          </h1>

          {/* Tablet & Desktop View: Flowing Headline */}
          <h1 className="hidden sm:block text-5xl md:text-6xl lg:text-[76px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.1]">
            <span className="block">Turn what you know into</span>
            <span className="inline-flex items-center flex-wrap justify-center gap-3 mt-2">
              <span className={`inline-flex items-center justify-center ${currentState.pillBg} ${currentState.pillText} rounded-full px-7 py-1 min-h-[64px]`}>
                <span
                  className={`inline-block font-medium tracking-[-0.04em] whitespace-nowrap transition-all duration-260 ease-out ${
                    isFading ? 'opacity-0 translate-y-2 blur-[1px]' : 'opacity-100 translate-y-0 blur-0'
                  }`}
                >
                  {currentState.pill}
                </span>
              </span>
              <span>
                <span
                  className={`inline-block transition-opacity duration-260 ${
                    isFading ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  {currentState.suffix}
                </span>
              </span>
            </span>
          </h1>

          {/* Supporting Paragraph: Clear Community Scope answering 4 Core Questions */}
          <p className="text-[14px] sm:text-[16px] text-[#141412] font-normal leading-[1.55] text-center max-w-[340px] sm:max-w-[540px] mx-auto pt-3 pb-2 sm:pt-4">
            A vibrant community for students, young creators, and curious minds to explore ideas, unlock potential, and grow together. Join our flagship Digital Poster Creation Contest 2026 or discover exciting learning opportunities.
          </p>

          {/* Action Buttons: Exact Side-by-Side Pair */}
          <div className="hero-anim-item flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-4 pb-2 relative z-10 w-full px-2">
            
            {/* Primary Action: Orange Pill with Arrow Circle Badge */}
            <Link
              href={mounted && isLoggedIn ? "/dashboard" : "/register"}
              className="group inline-flex items-center justify-center gap-2 pl-4 sm:pl-6 pr-1.5 sm:pr-2 py-2.5 sm:py-2 rounded-full bg-[#ff5a26] hover:bg-[#e85926] text-white font-medium text-[13px] sm:text-sm tracking-[-0.01em] shadow-xs active:scale-95 transition-all duration-200 shrink-0 whitespace-nowrap"
            >
              <span>{mounted && isLoggedIn ? "Participant Portal" : "Register for Contest"}</span>
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/25 flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              </span>
            </Link>

            {/* Secondary Action: Warm Neutral Pill without Icon */}
            <a
              href="#events-section"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-3 rounded-full bg-[#ede8e1] hover:bg-[#e2ded8] text-[#141412] font-medium text-[13px] sm:text-sm tracking-[-0.01em] active:scale-95 transition-all duration-200 shrink-0 whitespace-nowrap"
            >
              <span>Explore Opportunities</span>
            </a>

          </div>

        </div>

      </div>

      {/* 
        ========================================================================
        Bottom Floating Notification Area - Moving Infinite Marquee (Mobile & PC)
        ========================================================================
      */}
      <div className="hero-anim-item w-full relative z-10 pt-4 sm:pt-8">
        <div className="relative overflow-hidden">
          <div className="edge-blur-overlay-left hidden sm:block pointer-events-none" />
          <div className="edge-blur-overlay-right hidden sm:block pointer-events-none" />

          <div className="mask-fade-edges overflow-hidden py-1">
            <div className="animate-marquee flex gap-3.5 sm:gap-4 py-2" style={{ display: 'flex', width: 'max-content', flexDirection: 'row' }}>
              {[...TICKER_CARDS, ...TICKER_CARDS, ...TICKER_CARDS].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#f0ede8] border border-[#e5e1da] rounded-[20px] p-3 sm:p-3.5 flex items-center gap-3.5 shadow-2xs min-w-[280px] sm:min-w-[320px] transition-transform hover:scale-[1.02] cursor-default shrink-0"
                >
                  <div className={`w-10 h-10 rounded-[12px] ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                    {item.iconContent}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#141412] truncate">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#9c9a97] whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#706e6a] truncate mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom drag handle indicator matching reference screenshot */}
        <div className="w-12 h-1 rounded-full bg-[#d6d2cb] mx-auto mt-4 mb-2 sm:hidden" aria-hidden="true" />
      </div>

    </section>
  );
};
