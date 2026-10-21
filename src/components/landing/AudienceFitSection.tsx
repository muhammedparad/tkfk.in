'use client';

import React, { useEffect, useRef } from 'react';
import { GraduationCap, Award, Palette, Users, type LucideIcon } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

export const AudienceFitSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);
    if (cards.length !== AUDIENCES.length) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 640;
      const yOffsetStep = isMobile ? -22 : -28;
      const scaleStep = isMobile ? 0.025 : 0.035;

      // Initial placement: Card 0 resting in place, others waiting below off-screen
      gsap.set(cards[0], {
        y: 0,
        yPercent: 0,
        scale: 1,
        opacity: 1,
        transformOrigin: 'top center',
        force3D: true,
      });

      for (let i = 1; i < cards.length; i++) {
        gsap.set(cards[i], {
          yPercent: 120,
          scale: 1,
          opacity: 0,
          transformOrigin: 'top center',
          force3D: true,
        });
      }

      // Master smooth scroll-driven card stacking timeline
      // Pinned on the section container with scrub: 1.0 for buttery, fluid deceleration
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 76px', // Pins right below the 76px sticky header
          end: () => `+=${window.innerHeight * 1.8}`, // Perfectly tuned scroll distance
          pin: true,
          pinSpacing: true,
          scrub: 1.0, // 1-second momentum smoothing synchronized with Lenis
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Phase 1: Card 1 (Target Group 02) glides smoothly up into Card 0
      tl.to(cards[1], {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      }, 0);

      tl.to(cards[0], {
        y: yOffsetStep * 1,
        scale: 1 - scaleStep * 1,
        duration: 1,
        ease: 'power2.out',
      }, 0);

      // Micro-pause
      tl.to({}, { duration: 0.2 }, 1.0);

      // Phase 2: Card 2 (Target Group 03) glides smoothly up into Card 1
      tl.to(cards[2], {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      }, 1.2);

      tl.to(cards[1], {
        y: yOffsetStep * 1,
        scale: 1 - scaleStep * 1,
        duration: 1,
        ease: 'power2.out',
      }, 1.2);

      tl.to(cards[0], {
        y: yOffsetStep * 2,
        scale: 1 - scaleStep * 2,
        duration: 1,
        ease: 'power2.out',
      }, 1.2);

      // Micro-pause
      tl.to({}, { duration: 0.2 }, 2.2);

      // Phase 3: Card 3 (Target Group 04) glides smoothly up into Card 2
      tl.to(cards[3], {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
      }, 2.4);

      tl.to(cards[2], {
        y: yOffsetStep * 1,
        scale: 1 - scaleStep * 1,
        duration: 1,
        ease: 'power2.out',
      }, 2.4);

      tl.to(cards[1], {
        y: yOffsetStep * 2,
        scale: 1 - scaleStep * 2,
        duration: 1,
        ease: 'power2.out',
      }, 2.4);

      tl.to(cards[0], {
        y: yOffsetStep * 3,
        scale: 1 - scaleStep * 3,
        duration: 1,
        ease: 'power2.out',
      }, 2.4);

      // Phase 4: Gentle dwell to comfortably read Card 4 before unpinning
      tl.to({}, { duration: 0.5 }, 3.4);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="who"
      className="relative bg-[#f8f5f0] border-b border-[#f0ede8] overflow-hidden"
    >
      <div className="w-full min-h-[calc(100vh-76px)] flex flex-col justify-center py-10 sm:py-14">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 w-full">
          
          {/* Clean Asymmetric Section Heading */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-end mb-8 sm:mb-12">
            <div className="md:col-span-7 space-y-2.5">
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-[0.2em] uppercase block">
                WHO BELONGS HERE
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
                A community for curious minds at every stage of learning
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                From young explorers to college innovators and dedicated educators, TKFK provides pathways tailored to each group. Please note that specific competitions have designated eligibility criteria.
              </p>
            </div>
          </div>

          {/* Cards Stage Container */}
          <div className="relative w-full max-w-4xl mx-auto pt-16 sm:pt-20">
            {/* Natural Sizer: dictates accurate responsive container height across all devices */}
            <div
              className="invisible pointer-events-none p-6 sm:p-8 md:p-9 border border-transparent rounded-[28px] select-none"
              aria-hidden="true"
            >
              <div className="flex items-center justify-between border-b border-transparent pb-3 mb-4 sm:mb-5">
                <span className="text-[11px] font-mono">Target Group Sizer</span>
                <span className="text-[11px] font-mono">00 / 04</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
                <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-medium leading-tight">
                    College Students & Young Creators
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed max-w-2xl">
                    Build an authentic, demonstrable digital portfolio. Compete for cash awards up to ₹7,001 and enhance your profile with official jury-evaluated achievements. (Eligible for Digital Poster Contest 2026)
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5">Tag 1</span>
                    <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5">Tag 2</span>
                    <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5">Tag 3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GPU-Accelerated Stacked Cards */}
            {AUDIENCES.map((item, idx) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    cardsRef.current[idx] = el;
                  }}
                  className="absolute inset-x-0 top-16 sm:top-20 will-change-transform"
                  style={{ zIndex: (idx + 1) * 10 }}
                >
                  <div className="bg-[#f0ede8] border border-[#e5e1da] rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-9 shadow-[0_20px_45px_-12px_rgba(20,20,18,0.12),0_0_0_1px_rgba(229,225,218,0.8)] hover:shadow-kairu transition-shadow duration-300 group cursor-default">
                    {/* Card Header Strip (remains visible as cards stack into place) */}
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

                    {/* Card Body */}
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

                        {/* Highlight pills */}
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
      </div>
    </section>
  );
};
