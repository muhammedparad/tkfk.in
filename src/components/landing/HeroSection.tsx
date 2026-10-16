'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const ROTATING_WORDS = [
  'digital posters',
  'creative ideas',
  'visual designs',
  'statewide honors',
];

const TICKER_CARDS = [
  {
    iconBg: 'bg-[#ff90e8]', // Kairu Gumroad magenta
    iconContent: (
      <span className="font-extrabold text-base text-[#141412] leading-none font-sans">
        G
      </span>
    ),
    title: 'Pass Confirmed',
    time: '2m ago',
    detail: 'Ananya S. • Class 11, Kozhikode',
    highlight: '₹99 Verified',
  },
  {
    iconBg: 'bg-[#5521e2]', // Kairu Stripe purple
    iconContent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#ffc233]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'ID Pass Generated',
    time: '21m ago',
    detail: 'Rahul K. • College of Engg Trivandrum',
    highlight: '₹99 Confirmed',
  },
  {
    iconBg: 'bg-[#ffc233]', // Kairu Lemon Squeezy yellow
    iconContent: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#141412]">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Entry Submitted',
    time: '14m ago',
    detail: 'Devika M. • St. Teresa’s Ernakulam',
    highlight: 'Jury Review',
  },
  {
    iconBg: 'bg-[#141412]', // Dark contrast
    iconContent: (
      <span className="font-bold text-xs text-white">
        TK
      </span>
    ),
    title: 'Statewide Challenge 2026',
    time: '34m ago',
    detail: 'Mohammed F. • Farook College',
    highlight: '₹9,999 Prize',
  },
  {
    iconBg: 'bg-[#25D366]', // WhatsApp green
    iconContent: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>
    ),
    title: 'Community Cohort Active',
    time: '42m ago',
    detail: '14 District Hubs Connected',
    highlight: '12,500+ Peers',
  },
];

export const HeroSection: React.FC = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setIsFading(false);
      }, 240);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-transparent pt-8 sm:pt-14 pb-4 md:pb-8 border-b border-[#f0ede8]">
      
      {/* Exact Kairu Architectural Grid Linework (1px Orange Accent Lines) */}
      {/* 1. Center vertical orange line passing behind pill and paragraph */}
      <div 
        className="absolute top-[220px] xs:top-[240px] sm:top-[270px] left-1/2 -translate-x-1/2 w-[1px] h-[210px] sm:h-[240px] bg-[#ff6b35] pointer-events-none z-0" 
        aria-hidden="true"
      />
      {/* 2. Secondary vertical orange line below right button */}
      <div 
        className="absolute top-[480px] xs:top-[500px] sm:top-[530px] left-[calc(50%+85px)] sm:left-[calc(50%+115px)] w-[1px] h-[95px] sm:h-[120px] bg-[#ff6b35] pointer-events-none z-0" 
        aria-hidden="true"
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Trust Indicator: 5 Black Stars + Trust Label */}
        <ScrollReveal delayMs={0} direction="down">
          <div className="flex flex-col items-center justify-center space-y-1.5 mb-5 sm:mb-7 text-center">
            <div className="flex items-center gap-1 text-[#141412]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
              ))}
            </div>
            <p className="text-xs sm:text-sm font-normal text-[#141412] tracking-[-0.01em]">
              Trusted by 12,000+ participants
            </p>
          </div>
        </ScrollReveal>

        {/* Hero Headline: Exact Multi-line Layout with Salmon/Peach Rotating Pill */}
        <ScrollReveal delayMs={80} direction="up">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Mobile View: Exact 4-Line Break Layout from Reference Screenshot */}
            <h1 className="flex sm:hidden flex-col items-center text-[44px] xs:text-[50px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.05]">
              <span className="block">Turn what you</span>
              <span className="block">know into</span>
              
              {/* Salmon/Peach Rotating Pill */}
              <span className="my-1.5 inline-flex items-center justify-center">
                <span className="inline-flex items-center justify-center bg-[#f4c8be] text-[#141412] rounded-full px-5 py-0.5 transition-all duration-300 shadow-2xs min-h-[48px]">
                  <span
                    className={`inline-block font-medium tracking-[-0.04em] whitespace-nowrap transition-all duration-240 ease-out ${
                      isFading ? 'opacity-0 translate-y-2 blur-[1px]' : 'opacity-100 translate-y-0 blur-0'
                    }`}
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </span>
                </span>
              </span>

              <span className="block">that inspire</span>
            </h1>

            {/* Tablet & Desktop View: Flowing Headline */}
            <h1 className="hidden sm:block text-5xl md:text-6xl lg:text-[76px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.1]">
              <span className="block">Turn what you know into</span>
              <span className="inline-flex items-center flex-wrap justify-center gap-3 mt-2">
                <span className="inline-flex items-center justify-center bg-[#f4c8be] text-[#141412] rounded-full px-7 py-1 shadow-2xs min-h-[64px]">
                  <span
                    className={`inline-block font-medium tracking-[-0.04em] whitespace-nowrap transition-all duration-240 ease-out ${
                      isFading ? 'opacity-0 translate-y-2 blur-[1px]' : 'opacity-100 translate-y-0 blur-0'
                    }`}
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </span>
                </span>
                <span>that inspire</span>
              </span>
            </h1>

            {/* Supporting Paragraph: Authentic TKFK Content matching Reference Cadence */}
            <p className="text-[14px] sm:text-[16px] text-[#141412] font-normal leading-[1.6] text-center max-w-[340px] sm:max-w-[460px] mx-auto pt-4 pb-2">
              TKFK teaches you how to go from concept to recognition with digital poster design. One statewide contest, built for ambitious students who want to build a verified portfolio.
            </p>

            {/* Action Buttons: Exact Side-by-Side Kairu Pair */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 pt-4 pb-2 relative z-10">
              
              {/* Primary Action: Orange Pill with Arrow Circle Badge */}
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 sm:pl-6 sm:pr-2 sm:py-2 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs sm:text-sm tracking-[-0.01em] shadow-sm active:scale-95 transition-all duration-200"
              >
                <span>Get access</span>
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#ff865b] flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </span>
              </Link>

              {/* Secondary Action: Warm Neutral Pill without Icon */}
              <a
                href="#curriculum"
                className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#eae7e1] hover:bg-[#e2ded8] text-[#141412] font-medium text-xs sm:text-sm tracking-[-0.01em] active:scale-95 transition-all duration-200"
              >
                <span>Watch the trailer</span>
              </a>

            </div>

          </div>
        </ScrollReveal>

        {/* Bottom Infinite Notification Marquee: Cards Peeking Above Viewport Fold */}
        <div className="mt-10 sm:mt-14 pt-1 relative overflow-hidden">
          
          {/* Soft Left & Right Blurred Edge Overlays */}
          <div className="edge-blur-overlay-left hidden sm:block pointer-events-none" />
          <div className="edge-blur-overlay-right hidden sm:block pointer-events-none" />

          {/* Marquee Track with Horizontal Mask Dissolve */}
          <div className="mask-fade-edges overflow-hidden py-1">
            <div className="animate-marquee flex gap-3.5 sm:gap-4 py-2">
              {[...TICKER_CARDS, ...TICKER_CARDS, ...TICKER_CARDS].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#f0ede8] border border-[#e5e1da] rounded-[20px] p-3 sm:p-3.5 flex items-center gap-3.5 shadow-2xs min-w-[280px] sm:min-w-[320px] transition-transform hover:scale-[1.02] cursor-default shrink-0"
                >
                  {/* Square Rounded Icon Badge */}
                  <div className={`w-10 h-10 rounded-[12px] ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                    {item.iconContent}
                  </div>

                  {/* Card Content: Top Status + Relative Time, Bottom Detail */}
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

      </div>

    </section>
  );
};
