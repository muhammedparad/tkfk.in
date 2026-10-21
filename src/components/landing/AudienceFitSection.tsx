'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, Award, Palette, Users, Layers, type LucideIcon } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/components/providers/SmoothScrollProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AudienceItem {
  id: string;
  step: string;
  category: string;
  badge: string;
  icon: LucideIcon;
  description: string;
  eligibility: string;
  highlights: string[];
}

const AUDIENCES: AudienceItem[] = [
  {
    id: 'junior',
    step: '01',
    category: 'Children & Junior Learners',
    badge: 'Junior Learning Track',
    icon: Palette,
    description:
      'Curiosity-led art, basic visual storytelling, and exploratory creative tasks designed to nurture imagination and confidence without high-pressure competition. (Junior learning activities and creative prompts)',
    eligibility: 'Junior learning activities and creative prompts',
    highlights: ['Imagination & Art', 'Creative Prompts', 'Confidence Building'],
  },
  {
    id: 'school',
    step: '02',
    category: 'School Students (Classes 6–12)',
    badge: 'Contest Eligible',
    icon: GraduationCap,
    description:
      'Build creative confidence early. Compete on an all-India stage, represent your school, and earn verified credentials that enrich your extracurricular distinction. (Eligible for Digital Poster Contest 2026)',
    eligibility: 'Eligible for Digital Poster Contest 2026',
    highlights: ['National Stage', 'School Representation', 'Verifiable Certificate'],
  },
  {
    id: 'college',
    step: '03',
    category: 'College Students & Young Creators',
    badge: 'Contest Eligible',
    icon: Award,
    description:
      'Build an authentic, demonstrable digital portfolio. Compete for cash awards up to ₹7,001 and enhance your profile with official jury-evaluated achievements. (Eligible for Digital Poster Contest 2026)',
    eligibility: 'Eligible for Digital Poster Contest 2026',
    highlights: ['Cash Awards up to ₹7,001', 'Portfolio Building', 'Jury Evaluation'],
  },
  {
    id: 'educators',
    step: '04',
    category: 'Educators, Mentors & Curious Minds',
    badge: 'Institutional Track',
    icon: Users,
    description:
      'Guide student creators within your institution, integrate purposeful design challenges into campus activities, and collaborate on community-led learning initiatives.',
    eligibility: 'Campus Mentorship & Community Initiatives',
    highlights: ['Mentorship Pathways', 'Campus Design Challenges', 'Community Growth'],
  },
];

export const AudienceFitSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(prefersReduced);

    if (prefersReduced) return;

    const section = sectionRef.current;
    if (!section) return;

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null);
    if (cards.length !== AUDIENCES.length) return;

    // Use GSAP context for isolated scoping and memory-safe cleanup
    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 640;
      // Exact offset matches the tab strip height so all card tabs remain legible when stacked
      const yOffsetStep = isMobile ? -28 : -36;
      const scaleStep = isMobile ? 0.025 : 0.035;

      // Initial placement:
      // Card 0 (First Card) rests pinned in primary view
      gsap.set(cards[0], {
        y: 0,
        scale: 1,
        opacity: 1,
        transformOrigin: 'top center',
        force3D: true,
      });

      // Cards 1, 2, 3 wait translated off-screen below
      for (let i = 1; i < cards.length; i++) {
        gsap.set(cards[i], {
          yPercent: 125,
          scale: 1,
          opacity: 0,
          transformOrigin: 'top center',
          force3D: true,
        });
      }

      // Master scroll-driven stacking timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 76px', // Starts when section top reaches bottom of 76px sticky header
          end: () => `+=${window.innerHeight * 2.2}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.7, // Silky smooth scrub synchronized with Lenis physics
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.26) setActiveStep(0);
            else if (p < 0.56) setActiveStep(1);
            else if (p < 0.84) setActiveStep(2);
            else setActiveStep(3);
          },
        },
      });

      scrollTriggerRef.current = tl.scrollTrigger ?? null;

      // Phase 1: Card 1 (Target Group 02) stacks into Card 0
      tl.to(cards[1], {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
      }, 0);

      tl.to(cards[0], {
        y: yOffsetStep * 1,
        scale: 1 - scaleStep * 1,
        filter: 'brightness(0.96)',
        duration: 1,
        ease: 'power2.inOut',
      }, 0);

      // Micro-pause for reading / tactile feel
      tl.to({}, { duration: 0.2 }, 1);

      // Phase 2: Card 2 (Target Group 03) stacks into Card 1
      tl.to(cards[2], {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
      }, 1.2);

      tl.to(cards[1], {
        y: yOffsetStep * 1,
        scale: 1 - scaleStep * 1,
        filter: 'brightness(0.96)',
        duration: 1,
        ease: 'power2.inOut',
      }, 1.2);

      tl.to(cards[0], {
        y: yOffsetStep * 2,
        scale: 1 - scaleStep * 2,
        filter: 'brightness(0.92)',
        duration: 1,
        ease: 'power2.inOut',
      }, 1.2);

      // Micro-pause
      tl.to({}, { duration: 0.2 }, 2.2);

      // Phase 3: Card 3 (Target Group 04) stacks into Card 2
      tl.to(cards[3], {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power2.inOut',
      }, 2.4);

      tl.to(cards[2], {
        y: yOffsetStep * 1,
        scale: 1 - scaleStep * 1,
        filter: 'brightness(0.96)',
        duration: 1,
        ease: 'power2.inOut',
      }, 2.4);

      tl.to(cards[1], {
        y: yOffsetStep * 2,
        scale: 1 - scaleStep * 2,
        filter: 'brightness(0.92)',
        duration: 1,
        ease: 'power2.inOut',
      }, 2.4);

      tl.to(cards[0], {
        y: yOffsetStep * 3,
        scale: 1 - scaleStep * 3,
        filter: 'brightness(0.88)',
        duration: 1,
        ease: 'power2.inOut',
      }, 2.4);

      // Phase 4: Exploration dwell on Card 4 before unpinning
      tl.to({}, { duration: 0.6 }, 3.4);
    }, section);

    return () => {
      ctx.revert();
      scrollTriggerRef.current = null;
    };
  }, []);

  const handleStepClick = (stepIndex: number) => {
    if (!scrollTriggerRef.current) return;
    const st = scrollTriggerRef.current;
    const totalDuration = 4.0;
    // Map each card to its timeline keyframe point
    const progressMap = [0, 1.1 / totalDuration, 2.3 / totalDuration, 3.7 / totalDuration];
    const targetProgress = progressMap[stepIndex] ?? 0;
    const targetScroll = st.start + (st.end - st.start) * targetProgress;

    if (scrollTo) {
      scrollTo(targetScroll, { duration: 0.8 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="who"
      className="relative bg-[#f8f5f0] border-b border-[#f0ede8] overflow-hidden"
    >
      <div className="w-full min-h-[calc(100vh-76px)] flex flex-col justify-center py-8 sm:py-12">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 w-full">
          
          {/* Asymmetric Section Heading */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-end mb-6 sm:mb-8">
            <div className="md:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#ff6b35] tracking-[0.2em] uppercase">
                <Layers className="w-3.5 h-3.5" />
                <span>WHO BELONGS HERE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
                A community for curious minds at every stage of learning
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                From young explorers to college innovators and dedicated educators, TKFK provides pathways tailored to each group. Specific competitions have designated eligibility criteria.
              </p>
            </div>
          </div>

          {/* Interactive Stepper Tabs & Live Stack Progress */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {AUDIENCES.map((item, idx) => {
                const isActive = activeStep === idx;
                const isStacked = activeStep > idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleStepClick(idx)}
                    type="button"
                    aria-label={`View ${item.category}`}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-[#141412] text-white shadow-2xs scale-[1.02]'
                        : isStacked
                        ? 'bg-[#e7e3dc] text-[#57534e] hover:bg-[#ded9d0]'
                        : 'bg-[#f0ede8] text-[#706e6a] hover:text-[#141412] border border-[#e5e1da]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-[#ff6b35]' : isStacked ? 'bg-[#141412]' : 'bg-[#9c9a97]'
                      }`}
                    />
                    <span className="font-mono text-[11px]">0{idx + 1}</span>
                    <span className="hidden sm:inline">
                      {idx === 0 ? 'Junior' : idx === 1 ? 'School' : idx === 2 ? 'College' : 'Educators'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#9c9a97] shrink-0">
              <span>Scroll to stack deck</span>
              <span className="text-[#ff6b35] font-semibold">{activeStep + 1} / 4</span>
            </div>
          </div>

          {/* Cards Stage Container */}
          {isReducedMotion ? (
            /* Accessible Static View for Users with Reduced Motion */
            <div className="space-y-4 pt-4">
              {AUDIENCES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-[#f0ede8] border border-[#e5e1da] rounded-[24px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 shadow-2xs"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e1da] flex items-center justify-center text-[#ff6b35] shrink-0 shadow-2xs">
                      <Icon className="w-7 h-7" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <span className="text-[11px] font-mono text-[#9c9a97] uppercase tracking-wider block">
                        Target Group 0{idx + 1}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-medium text-[#141412] tracking-[-0.03em]">
                        {item.category}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Scroll-Driven Pinned Stacking Deck */
            <div className="relative w-full max-w-4xl mx-auto pt-24 sm:pt-32">
              {/* Invisible Sizer to naturally dictate responsive container height without hardcoding */}
              <div
                className="invisible pointer-events-none p-5 sm:p-7 md:p-8 border border-transparent rounded-[28px] select-none"
                aria-hidden="true"
              >
                <div className="flex items-center justify-between border-b border-transparent pb-3 mb-4">
                  <span className="text-[11px] font-mono">Target Group Sizer</span>
                  <span className="text-[11px] font-mono">00 / 04</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl sm:text-2xl md:text-[26px] font-medium leading-tight">
                      College Students & Young Creators
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed max-w-2xl">
                      Build an authentic, demonstrable digital portfolio. Compete for cash awards up to ₹7,001 and enhance your profile with official jury-evaluated achievements. (Eligible for Digital Poster Contest 2026)
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5">Tag 1</span>
                      <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5">Tag 2</span>
                      <span className="text-[10px] sm:text-[11px] font-mono px-2.5 py-0.5">Tag 3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Absolute Real Cards Pinned Stack */}
              {AUDIENCES.map((item, idx) => {
                const Icon = item.icon;
                const isCurrent = activeStep === idx;
                const isUnder = activeStep > idx;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardsRef.current[idx] = el;
                    }}
                    onClick={() => {
                      if (!isCurrent) handleStepClick(idx);
                    }}
                    className="absolute inset-x-0 top-24 sm:top-32 will-change-transform cursor-pointer transition-shadow duration-300"
                    style={{ zIndex: (idx + 1) * 10 }}
                  >
                    <div
                      className={`relative bg-[#f0ede8] border border-[#e5e1da] rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 md:p-8 transition-all duration-300 ${
                        isCurrent
                          ? 'shadow-[0_22px_50px_-15px_rgba(20,20,18,0.14),0_0_0_1px_rgba(229,225,218,0.9)]'
                          : isUnder
                          ? 'shadow-[0_8px_20px_-8px_rgba(20,20,18,0.08)]'
                          : 'shadow-card'
                      }`}
                    >
                      {/* Card Header Strip / Tab (stays visible when cards stack!) */}
                      <div className="flex items-center justify-between border-b border-[#e5e1da] pb-3 mb-4 sm:mb-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                              isCurrent ? 'bg-[#ff6b35]' : 'bg-[#9c9a97]'
                            }`}
                          />
                          <span className="text-[11px] font-mono text-[#706e6a] uppercase tracking-wider font-semibold">
                            Target Group 0{idx + 1}
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

                      {/* Card Body Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[#e5e1da] flex items-center justify-center text-[#ff6b35] shrink-0 shadow-2xs group-hover:scale-105 transition-all duration-300">
                          <Icon className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.8} />
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <h3 className="text-xl sm:text-2xl md:text-[24px] font-medium text-[#141412] tracking-[-0.03em] leading-tight">
                            {item.category}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal max-w-2xl">
                            {item.description}
                          </p>

                          {/* Category Tag Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1.5">
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

                      {/* Visual indicator showing it's clickable to bring to front if stacked underneath */}
                      {isUnder && (
                        <div className="absolute top-2.5 right-4 text-[10px] font-mono text-[#ff6b35] bg-white/90 border border-[#e5e1da] px-2 py-0.5 rounded-full shadow-2xs sm:hidden">
                          Tap to view
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
