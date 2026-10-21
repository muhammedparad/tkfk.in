'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, Award, Palette, Users, LucideIcon } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AudienceItem {
  id: string;
  icon: LucideIcon;
  category: string;
  tag: string;
  description: string;
  isEligible?: boolean;
}

const AUDIENCES: AudienceItem[] = [
  {
    id: 'junior',
    icon: Palette,
    category: 'Children & Junior Learners',
    tag: 'Target Group 01',
    description: 'Curiosity-led art, basic visual storytelling, and exploratory creative tasks designed to nurture imagination and confidence without high-pressure competition. (Junior learning activities and creative prompts)',
    isEligible: false,
  },
  {
    id: 'school',
    icon: GraduationCap,
    category: 'School Students (Classes 6–12)',
    tag: 'Target Group 02',
    description: 'Build creative confidence early. Compete on an all-India stage, represent your school, and earn verified credentials that enrich your extracurricular distinction. (Eligible for Digital Poster Contest 2026)',
    isEligible: true,
  },
  {
    id: 'college',
    icon: Award,
    category: 'College Students & Young Creators',
    tag: 'Target Group 03',
    description: 'Build an authentic, demonstrable digital portfolio. Compete for cash awards up to ₹7,001 and enhance your profile with official jury-evaluated achievements. (Eligible for Digital Poster Contest 2026)',
    isEligible: true,
  },
  {
    id: 'mentors',
    icon: Users,
    category: 'Educators, Mentors & Curious Minds',
    tag: 'Target Group 04',
    description: 'Guide student creators within your institution, integrate purposeful design challenges into campus activities, and collaborate on community-led learning initiatives.',
    isEligible: false,
  },
];

export const AudienceFitSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseTop = isMobile ? 76 : 96;
  const offset = isMobile ? 36 : 46;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const totalCards = AUDIENCES.length;
    if (totalCards <= 1) return;

    const ctx = gsap.context(() => {
      // Coordinate progressive depth and scale as incoming cards scroll over earlier cards
      for (let i = 0; i < totalCards - 1; i++) {
        const currentInner = cardInnersRef.current[i];
        const nextWrapper = cardWrappersRef.current[i + 1];

        if (!currentInner || !nextWrapper) continue;

        const nextStickyTop = () => {
          const isDesk = window.innerWidth >= 640;
          const b = isDesk ? 96 : 76;
          const o = isDesk ? 46 : 36;
          return `top ${b + (i + 1) * o}px`;
        };

        // Smoothly scale down and subtly dim the card immediately underneath
        gsap.to(currentInner, {
          scale: 0.965,
          filter: 'brightness(0.96)',
          ease: 'none',
          scrollTrigger: {
            trigger: nextWrapper,
            start: 'top 80%',
            end: nextStickyTop,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        // For deeper cards in the deck, scale down further to intensify tactile 3D perspective
        for (let j = 0; j < i; j++) {
          const deepInner = cardInnersRef.current[j];
          if (!deepInner) continue;

          const depthStep = i - j + 1;
          gsap.to(deepInner, {
            scale: Math.max(0.89, 0.965 - depthStep * 0.025),
            filter: `brightness(${Math.max(0.88, 0.96 - depthStep * 0.035)})`,
            ease: 'none',
            scrollTrigger: {
              trigger: nextWrapper,
              start: 'top 80%',
              end: nextStickyTop,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [baseTop, offset]);

  return (
    <section 
      className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8] relative" 
      id="who"
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Asymmetric Section Heading */}
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-14 sm:mb-18">
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-[0.2em] uppercase block">
                WHO BELONGS HERE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
                A community for curious minds at every stage of learning
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed font-normal">
                From young explorers to college innovators and dedicated educators, TKFK provides pathways tailored to each group. Please note that specific competitions have designated eligibility criteria.
              </p>
            </div>
          </div>
        </GsapReveal>

        {/* Premium Sticky Stacking Cards Deck */}
        <div ref={containerRef} className="relative pb-32 sm:pb-48">
          {AUDIENCES.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === AUDIENCES.length - 1;

            return (
              <div 
                key={item.id} 
                ref={(el) => { cardWrappersRef.current[idx] = el; }}
                className="who-sticky-card"
                style={{ 
                  position: 'sticky',
                  top: `${baseTop + idx * offset}px`,
                  zIndex: 10 + idx,
                  marginBottom: isLast ? '0px' : 'clamp(180px, 35vh, 280px)',
                }}
              >
                <div
                  ref={(el) => { cardInnersRef.current[idx] = el; }}
                  className="bg-[#f0ede8] border border-[#e5e1da] rounded-[24px] sm:rounded-[28px] overflow-hidden transition-shadow duration-300 group cursor-default"
                  style={{
                    transformOrigin: 'top center',
                    willChange: 'transform, filter',
                    boxShadow: '0 -3px 12px -2px rgba(20, 20, 18, 0.04), 0 20px 40px -8px rgba(20, 20, 18, 0.1), 0 2px 6px rgba(20, 20, 18, 0.03)',
                  }}
                >
                  {/* Physical Stacking Tab Header: Remains visible and crisp throughout stack sequence */}
                  <div className="h-[42px] sm:h-[46px] px-5 sm:px-8 bg-[#ebe6df]/90 border-b border-[#e5e1da] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-[#ff6b35] shrink-0" />
                      <span className="text-[11px] font-mono font-semibold text-[#ff6b35] uppercase tracking-wider shrink-0">
                        {item.tag}
                      </span>
                      <span className="text-[#9c9a97] text-xs font-mono">•</span>
                      <span className="text-xs sm:text-sm font-semibold text-[#141412] truncate">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/95 border border-[#e5e1da] text-[#706e6a] shadow-2xs font-semibold">
                        0{idx + 1} / 0{AUDIENCES.length}
                      </span>
                    </div>
                  </div>

                  {/* Main Card Body */}
                  <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#e5e1da] group-hover:border-[#ff6b35]/40 group-hover:bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35] shrink-0 group-hover:scale-105 transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.8} />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-xl sm:text-2xl font-medium text-[#141412] tracking-[-0.03em] group-hover:text-[#ff6b35] transition-colors">
                          {item.category}
                        </h3>
                        {item.isEligible && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/25 shadow-2xs">
                            Poster Contest 2026
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
