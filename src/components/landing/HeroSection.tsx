'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Play, Star, ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const HIGHLIGHT_WORDS = [
  { text: 'digital posters', bg: 'bg-[#f5b49c]/40', textCol: 'text-[#141412]' },
  { text: 'creative ideas', bg: 'bg-[#ffe09a]/60', textCol: 'text-[#141412]' },
  { text: 'national honors', bg: 'bg-[#bce8f5]/60', textCol: 'text-[#141412]' },
];

const NOTIFICATIONS = [
  {
    iconBg: 'bg-[#0066FF]',
    iconSvg: '🎨',
    title: 'Poster Contest 2026',
    time: '2m ago',
    message: 'New participant registration verified',
    badge: '₹9,999 Prize',
  },
  {
    iconBg: 'bg-[#ff6b35]',
    iconSvg: '📜',
    title: 'Participant Pass Desk',
    time: '8m ago',
    message: 'Official digital ID credential issued',
    badge: 'Verified ID',
  },
  {
    iconBg: 'bg-[#10b981]',
    iconSvg: '🏆',
    title: 'Merit Recognition',
    time: '21m ago',
    message: 'Statewide jury evaluation guidelines live',
    badge: 'State Honors',
  },
  {
    iconBg: 'bg-[#8b5cf6]',
    iconSvg: '🔔',
    title: 'Republic Day Quiz',
    time: '34m ago',
    message: 'Scheduled on national calendar for 26 Jan',
    badge: 'National Stage',
  },
  {
    iconBg: 'bg-[#ff6b35]',
    iconSvg: '✨',
    title: 'Creative Cohort',
    time: '42m ago',
    message: 'Kerala & All-India students connected',
    badge: 'Active Cohort',
  },
];

export const HeroSection: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HIGHLIGHT_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const current = HIGHLIGHT_WORDS[index];

  return (
    <section className="relative overflow-hidden bg-transparent pt-10 pb-16 md:pt-16 md:pb-20 border-b border-[#f0ede8]">
      
      {/* Decorative vertical and horizontal orange accent lines with subtle glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-[1100px] h-[450px] pointer-events-none">
        <div className="absolute top-10 left-8 w-[1.5px] h-28 bg-[#ff6b35] animate-line-glow hidden lg:block shadow-[0_0_8px_rgba(255,107,53,0.5)]" />
        <div className="absolute bottom-28 right-8 w-32 h-[1.5px] bg-[#ff6b35]/40 hidden lg:block" />
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* 4.1 Trust indicator */}
        <ScrollReveal delayMs={0} direction="down">
          <div className="flex flex-col items-center justify-center space-y-1.5 mb-6 text-center">
            <div className="flex items-center gap-1 text-[#141412]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
              ))}
            </div>
            <p className="text-[12px] font-medium text-[#706e6a]">
              Trusted by <AnimatedCounter value={2500} suffix="+" durationMs={1200} /> participants & students
            </p>
          </div>
        </ScrollReveal>

        {/* 4.2 & 4.3 Headline typography with animated keyword highlight */}
        <ScrollReveal delayMs={100} direction="up">
          <div className="text-center max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.1]">
              <span className="block">Turn what you know into</span>
              <span className="inline-flex items-center flex-wrap justify-center gap-2 mt-1 sm:mt-2">
                <span 
                  className={`inline-block font-medium tracking-[-0.04em] px-3.5 py-1 sm:px-5 sm:py-1.5 rounded-2xl ${current.bg} ${current.textCol} transition-all duration-500 ease-out`}
                >
                  {current.text}
                </span>
                <span className="tracking-[-0.04em]">that inspire</span>
              </span>
            </h1>

            {/* 4.4 Supporting paragraph */}
            <p className="text-sm sm:text-base lg:text-lg text-[#706e6a] font-normal leading-relaxed max-w-xl mx-auto pt-2">
              TKFK empowers curious minds through national creative competitions, intellectual challenges, and verified credentials. One platform built for students who want to build a real portfolio.
            </p>

            {/* 4.5 CTA pair with Kairu button anatomy */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              {/* Primary Capsule Button */}
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 pl-6 pr-2 py-2 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-sm shadow-sm hover:shadow-lg hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200"
              >
                <span>Get access</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>

              {/* Secondary Neutral Button */}
              <a
                href="#preview"
                className="inline-flex items-center justify-center gap-2 bg-[#fafafb]/90 hover:bg-white text-[#141412] border border-[#f0ede8] px-6 py-3.5 rounded-full font-medium text-sm transition-all duration-200 shadow-2xs hover:shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-[#141412]" />
                <span>Watch the overview</span>
              </a>
            </div>

          </div>
        </ScrollReveal>

        {/* 4.7 Animated horizontal notification strip with left & right blurred edges */}
        <div className="mt-14 sm:mt-16 pt-2 relative overflow-hidden">
          
          {/* Subtle Left & Right Edge Blurs */}
          <div className="edge-blur-overlay-left hidden sm:block" />
          <div className="edge-blur-overlay-right hidden sm:block" />

          {/* Marquee Track with Fade Mask */}
          <div className="mask-fade-edges overflow-hidden py-1">
            <div className="animate-marquee flex gap-4 py-2">
              {[...NOTIFICATIONS, ...NOTIFICATIONS, ...NOTIFICATIONS].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#fafafb]/95 border border-[#f0ede8] rounded-2xl px-4 py-3 flex items-center gap-3.5 shadow-2xs min-w-[280px] sm:min-w-[320px] transition-transform hover:scale-[1.02] cursor-default"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#f0ede8] flex items-center justify-center text-base shrink-0">
                    {item.iconSvg}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#141412] truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[#9c9a97] whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#706e6a] truncate mt-0.5">
                      {item.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-[#ff6b35] bg-[#ff6b35]/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                      {item.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile scroll prompt */}
        <div className="pt-6 flex md:hidden items-center justify-center">
          <a href="#preview" className="inline-flex flex-col items-center gap-1 text-[11px] font-medium text-[#9c9a97] hover:text-[#141412] transition-colors">
            <span>Scroll to explore</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#ff6b35]" />
          </a>
        </div>

      </div>

      {/* Visual connector line linking Hero to Media Preview */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] h-6 bg-gradient-to-b from-[#ff6b35] to-transparent pointer-events-none hidden md:block" />
    </section>
  );
};
