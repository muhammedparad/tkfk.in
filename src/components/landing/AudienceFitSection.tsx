'use client';

import React, { useEffect, useRef } from 'react';
import { GraduationCap, Award, Palette, Users, type LucideIcon } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GsapReveal } from '@/components/ui/GsapReveal';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AudienceItem {
  id: string;
  tag: string;
  badge: string;
  icon: LucideIcon;
  category: string;
  description: string;
  highlights: string[];
}

const AUDIENCES: AudienceItem[] = [
  {
    id: 'junior',
    tag: 'Target Group 01',
    badge: 'Junior Learning Track',
    icon: Palette,
    category: 'Children & Junior Learners',
    description:
      'Curiosity-led art, basic visual storytelling, and exploratory creative tasks designed to nurture imagination and confidence without high-pressure competition. (Junior learning activities and creative prompts)',
    highlights: ['Imagination & Art', 'Creative Prompts', 'Confidence Building'],
  },
  {
    id: 'school',
    tag: 'Target Group 02',
    badge: 'Contest Eligible',
    icon: GraduationCap,
    category: 'School Students (Classes 6–12)',
    description:
      'Build creative confidence early. Compete on an all-India stage, represent your school, and earn verified credentials that enrich your extracurricular distinction. (Eligible for Digital Poster Contest 2026)',
    highlights: ['National Stage', 'School Representation', 'Verifiable Certificate'],
  },
  {
    id: 'college',
    tag: 'Target Group 03',
    badge: 'Contest Eligible',
    icon: Award,
    category: 'College Students & Young Creators',
    description:
      'Build an authentic, demonstrable digital portfolio. Compete for cash awards up to ₹7,001 and enhance your profile with official jury-evaluated achievements. (Eligible for Digital Poster Contest 2026)',
    highlights: ['Cash Awards up to ₹7,001', 'Portfolio Building', 'Jury Evaluation'],
  },
  {
    id: 'educators',
    tag: 'Target Group 04',
    badge: 'Institutional Track',
    icon: Users,
    category: 'Educators, Mentors & Curious Minds',
    description:
      'Guide student creators within your institution, integrate purposeful design challenges into campus activities, and collaborate on community-led learning initiatives.',
    highlights: ['Mentorship Pathways', 'Campus Design Challenges', 'Community Growth'],
  },
];

const STICKY_OFFSETS = [
  { mobile: 90, desktop: 120 },
  { mobile: 114, desktop: 148 },
  { mobile: 138, desktop: 176 },
  { mobile: 162, desktop: 204 },
];

export const AudienceFitSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Natural subtle scroll-linked scaling as subsequent cards stack into place
      innerCardsRef.current.forEach((card, idx) => {
        if (!card || idx === AUDIENCES.length - 1) return;
        const nextWrapper = cardWrappersRef.current[idx + 1];
        if (!nextWrapper) return;

        gsap.to(card, {
          scale: 0.965,
          transformOrigin: 'top center',
          ease: 'power1.out',
          scrollTrigger: {
            trigger: nextWrapper,
            start: 'top 85%',
            end: 'top 220px',
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="who">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Clean Original Section Heading */}
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-16 sm:mb-20">
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

        {/* Natural Smooth-Scroll Stacking Cards Deck */}
        <div ref={containerRef} className="relative pb-24 sm:pb-36 space-y-20 sm:space-y-28">
          {AUDIENCES.map((item, idx) => {
            const Icon = item.icon;
            const offset = STICKY_OFFSETS[idx] || STICKY_OFFSETS[0];

            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardWrappersRef.current[idx] = el;
                }}
                className="sticky will-change-transform top-[var(--top-m)] sm:top-[var(--top-d)]"
                style={
                  {
                    '--top-m': `${offset.mobile}px`,
                    '--top-d': `${offset.desktop}px`,
                    zIndex: idx + 1,
                  } as React.CSSProperties
                }
              >
                <div
                  ref={(el) => {
                    innerCardsRef.current[idx] = el;
                  }}
                  className="bg-[#f0ede8] border border-[#e5e1da] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-9 shadow-[0_20px_45px_-12px_rgba(20,20,18,0.12),0_0_0_1px_rgba(229,225,218,0.8)] hover:shadow-kairu transition-all duration-300 group cursor-default"
                >
                  {/* Card Header Strip */}
                  <div className="flex items-center justify-between border-b border-[#e5e1da]/80 pb-3 mb-4 sm:mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
                      <span className="text-[11px] font-mono text-[#706e6a] uppercase tracking-wider font-semibold">
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-mono text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/25 px-2.5 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                      <span className="text-[11px] font-mono text-[#9c9a97]">
                        0{idx + 1} / 04
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#e5e1da] group-hover:border-[#ff6b35]/40 group-hover:bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35] shrink-0 group-hover:scale-105 transition-all duration-300 shadow-2xs">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <h3 className="text-xl sm:text-2xl font-medium text-[#141412] tracking-[-0.03em] group-hover:text-[#ff6b35] transition-colors">
                        {item.category}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal max-w-2xl">
                        {item.description}
                      </p>

                      {/* Category highlight pills */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2">
                        {item.highlights.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] sm:text-[11px] font-mono text-[#57534e] bg-white/80 border border-[#e5e1da] px-2.5 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
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
