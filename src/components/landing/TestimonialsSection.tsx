'use client';

import React, { useRef, useState } from 'react';
import { Star, User } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';

interface TestimonialItem {
  category: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
  metricLabel: string;
  metricValue: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    category: 'National Quiz Initiative',
    quote: '“It was a nice experience and a completely different way of conducting a quiz. Thanks, TKFK, for making it so unique!”',
    name: 'Swalih',
    role: 'Participant',
    initials: 'SW',
    metricLabel: 'Format',
    metricValue: 'Unique Quiz',
  },
  {
    category: 'Study & Learning Modules',
    quote: '“The module books provided great insight into the specific topics and helped me understand them better.”',
    name: 'Anonymous Participant',
    role: 'Quiz Participant',
    initials: 'AP',
    metricLabel: 'Resource',
    metricValue: 'Module Insight',
  },
  {
    category: 'Merit Recognition & Honors',
    quote: '“The award was really eye-catching, and it motivated me to participate. It definitely caught my attention!”',
    name: 'Fathima Farha',
    role: 'Award Winner',
    initials: 'FF',
    metricLabel: 'Motivation',
    metricValue: 'Award Winner',
  },
  {
    category: 'Participant Support Desk',
    quote: '“I really appreciated how the team managed and resolved the issues that came up during the quiz. They responded well and considered every participant’s needs. It was a great experience!”',
    name: 'Ahmed Ameen',
    role: 'Quiz Participant',
    initials: 'AA',
    metricLabel: 'Support Desk',
    metricValue: 'Active Care',
  },
  {
    category: 'Student-Led Community',
    quote: '“I was astonished when I discovered that TKFK is run by students. It’s amazing to see what you’ve built. Keep up the great work!”',
    name: 'Sharon PO',
    role: 'Participant',
    initials: 'SP',
    metricLabel: 'Initiative',
    metricValue: 'Student-Led',
  },
];

export const TestimonialsSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Triple the array for seamless infinite looping without visible jumps
  const carouselItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8] overflow-hidden relative">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header Matching Kairu Reference */}
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              Stories, creations, and achievements
            </h2>

            {/* Overlapping Neutral Avatars + 5 Stars + Trust Statement */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="flex -space-x-2 overflow-hidden py-1">
                {TESTIMONIALS.map((item, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-[#f8f5f0] bg-[#edeae4] text-[#706e6a] text-[10px] sm:text-xs font-semibold shadow-2xs"
                    title={item.name}
                  >
                    {item.initials}
                  </div>
                ))}
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-0.5 text-[#141412]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
                  ))}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-[#706e6a]">
                  Participant feedback from past TKFK initiatives
                </span>
              </div>
            </div>
          </div>
        </GsapReveal>

      </div>

      {/* Horizontal Carousel Track with 100% crisp readability */}
      <div 
        className="relative w-full max-w-full overflow-hidden py-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="overflow-hidden no-scrollbar w-full max-w-full cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div 
            className="animate-marquee-slow flex items-stretch gap-6 px-4 sm:px-8 py-2"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          >
            {carouselItems.map((item, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[360px] lg:w-[380px] shrink-0 bg-[#f0ede8]/60 hover:bg-[#f0ede8] border border-[#f0ede8] hover:border-[#ff6b35]/40 rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-kairu hover:-translate-y-1 select-none"
              >
                {/* Top Section: 5 Stars + Category */}
                <div className="space-y-3.5 text-center">
                  <div className="flex items-center justify-center gap-1 text-[#9c9a97]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#9c9a97] text-[#9c9a97]" />
                    ))}
                  </div>

                  <span className="text-xs font-mono text-[#706e6a] tracking-wider uppercase block">
                    {item.category}
                  </span>

                  <p className="text-xs sm:text-sm text-[#141412] leading-relaxed font-normal text-center pt-2">
                    {item.quote}
                  </p>
                </div>

                {/* Bottom Row: Neutral Avatar on Left, Metric on Right */}
                <div className="pt-6 border-t border-[#e8e4de] flex items-center justify-between mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#edeae4] border border-[#e2ded8] flex items-center justify-center text-[#706e6a] font-semibold text-xs shrink-0 shadow-2xs">
                      {item.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#141412]">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-[#9c9a97]">
                        {item.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-[#9c9a97] uppercase tracking-wider block">
                      {item.metricLabel}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#ff6b35]">
                      {item.metricValue}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transparent Implementation Note */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <p className="text-[11px] text-[#9c9a97] text-center mt-6 max-w-lg mx-auto font-normal">
          *Lightly edited participant feedback from past TKFK initiatives. Neutral placeholders used pending participant photo permissions.
        </p>
      </div>

    </section>
  );
};
