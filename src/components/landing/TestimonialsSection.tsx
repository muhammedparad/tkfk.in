'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface TestimonialItem {
  category: string;
  quote: string;
  name: string;
  location: string;
  metricLabel: string;
  metricValue: string;
  avatar: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    category: 'Digital Poster Contest 2026',
    quote: '"I had the digital design skills, but never had an official platform to showcase them. The feedback, participant pass, and cash prize changed how I view my creative potential."',
    name: 'Ananya S.',
    location: 'Kozhikode',
    metricLabel: '1st Prize Reward',
    metricValue: '₹9,999',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    category: 'Kerala State Merit Recognition',
    quote: '"The instant official ID pass and verified certificate gave me tangible credentials that I proudly included in my higher education portfolio. Transparent and inspiring."',
    name: 'Rohan Verma',
    location: 'Thrissur',
    metricLabel: 'Statewide Rank',
    metricValue: 'Rank 1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    category: 'Visual Arts Cohort',
    quote: '"The detailed guidelines and prompt selection helped me move from rough sketches to a finished artwork. The ₹99 entry fee was the best investment in my learning this year."',
    name: 'Farhan K.',
    location: 'Malappuram',
    metricLabel: 'Jury Evaluation',
    metricValue: '98.5%',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    category: 'Creative Design Challenge',
    quote: '"TKFK\'s multi-parameter evaluation rubrics are transparent and rigorous. Seeing our work reviewed by cultural mentors across Kerala gave our entire design club immense motivation."',
    name: 'Meera N.',
    location: 'Thiruvananthapuram',
    metricLabel: 'Merit Distinction',
    metricValue: 'Top 5',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    category: 'National Knowledge Quiz',
    quote: '"From registration to pass generation, everything worked seamlessly. The guidelines on typography and visual hierarchy helped me craft something I am genuinely proud of."',
    name: 'Adithya R.',
    location: 'Ernakulam',
    metricLabel: 'District Rank',
    metricValue: 'Rank 1',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
  {
    category: 'Campus Creative Ambassador',
    quote: '"Being part of TKFK\'s grassroots student community connected me with creative minds from all 14 districts. The focus on purposeful, meaningful themes makes every contest special."',
    name: 'Sneha P.',
    location: 'Palakkad',
    metricLabel: 'Cohort Score',
    metricValue: '96/100',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
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
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              Real creators turning ideas into statewide impact
            </h2>

            {/* Overlapping Avatars + 5 Stars + Trust Statement */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="flex -space-x-2 overflow-hidden py-1">
                <Image
                  width={34}
                  height={34}
                  unoptimized
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-[#f8f5f0] object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="Student Participant"
                />
                <Image
                  width={34}
                  height={34}
                  unoptimized
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-[#f8f5f0] object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                  alt="Student Participant"
                />
                <Image
                  width={34}
                  height={34}
                  unoptimized
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-[#f8f5f0] object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                  alt="Student Participant"
                />
                <Image
                  width={34}
                  height={34}
                  unoptimized
                  className="inline-block h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-[#f8f5f0] object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                  alt="Student Participant"
                />
              </div>

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-0.5 text-[#141412]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#141412] text-[#141412]" />
                  ))}
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-[#706e6a]">
                  Trusted by 2,500+ participants
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* Horizontal Carousel Track with Stylish Blurring on Both Sides */}
      <div 
        className="relative w-full max-w-full overflow-hidden py-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Stylish Frosted Edge Blur Overlay */}
        <div className="edge-blur-carousel-left" aria-hidden="true" />
        
        {/* Right Stylish Frosted Edge Blur Overlay */}
        <div className="edge-blur-carousel-right" aria-hidden="true" />

        {/* Carousel Container with Masked Edge Gradients */}
        <div 
          ref={scrollContainerRef}
          className="mask-fade-edges overflow-hidden no-scrollbar w-full max-w-full cursor-grab active:cursor-grabbing"
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

                {/* Bottom Row: Avatar on Left, Metric on Right */}
                <div className="pt-6 border-t border-[#e8e4de] flex items-center justify-between mt-6">
                  <div className="flex items-center gap-3">
                    <Image
                      width={42}
                      height={42}
                      unoptimized
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#f0ede8]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#141412]">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-[#9c9a97]">
                        {item.location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-[#9c9a97] uppercase tracking-wider block">
                      {item.metricLabel}
                    </span>
                    <span className="text-lg sm:text-xl font-extrabold text-[#ff6b35]">
                      {item.metricValue}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};
