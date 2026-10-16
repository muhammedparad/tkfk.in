'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface TimelinePhase {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PHASES: TimelinePhase[] = [
  {
    id: 'w1',
    badge: 'W1',
    title: 'Find the concept that carries real meaning',
    description: 'Choose your creative theme from the official guidelines. Confirm your prompt and receive your official digital participant pass before writing a single word or placing your first shape.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
        <path d="M24 10a12 12 0 0 0-8 21c1.5 1.5 2 3 2 5h12c0-2 .5-3.5 2-5a12 12 0 0 0-8-21z" fill="#f5b49c" stroke="#141412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 36h8M22 40h4" stroke="#141412" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 16v6" stroke="#141412" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'w2',
    badge: 'W2',
    title: 'From blank canvas to finished artwork',
    description: 'Follow the digital build guidelines, grid framing rules, and visual hierarchy principles. Produce a complete original entry. Not a rough draft, not a sketch. Something worthy of statewide exhibition.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
        <path d="M24 8l16 8v16l-16 8-16-8V16l16-8z" fill="#f5b49c" stroke="#141412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M24 24L8 16M24 24l16-8M24 24v16" stroke="#141412" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'w3',
    badge: 'W3',
    title: 'Submitted, verified and ready for jury review',
    description: 'Upload your high-resolution artwork to your participant portal before the deadline. Instant verification verifies dimensions, compliance, and secures your place on the official roster.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
        <path d="M8 18l4-8h24l4 8H8z" fill="#f5b49c" stroke="#141412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 18v20a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2V18" stroke="#141412" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 40V28h8v12" stroke="#141412" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'w4',
    badge: 'W4',
    title: 'Recognition, cash rewards & lifetime credentials',
    description: 'Statewide jury evaluation, cash rewards up to ₹9,999, and verified digital credentials that validate your extracurricular achievements on college applications and professional portfolios.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-105">
        <circle cx="24" cy="24" r="14" fill="#f5b49c" stroke="#141412" strokeWidth="2" />
        <circle cx="24" cy="24" r="6" fill="#f8f5f0" stroke="#141412" strokeWidth="2" />
        <path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8" stroke="#141412" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const TransformationTimelineSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const windowCenter = window.innerHeight * 0.55;
      cardRefs.current.forEach((ref, idx) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.top <= windowCenter && rect.bottom >= windowCenter - 100) {
            setActiveStep(idx);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="timeline">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
              THE TRANSFORMATION
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              From blank canvas to state recognition in four phases
            </h2>

            <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed max-w-lg mx-auto font-normal">
              TKFK is structured around outcomes, not passive lessons. From picking the right theme to making your official submission.
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline Layout */}
        <div className="max-w-3xl mx-auto relative">
          
          {/* Vertical Connecting Line */}
          <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-[2px] bg-[#f0ede8] rounded-full overflow-hidden">
            {/* Animated Active Line Indicator with smooth transition */}
            <div 
              className="w-full bg-[#ff6b35] rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_10px_rgba(255,107,53,0.5)]"
              style={{
                height: `${((activeStep + 1) / PHASES.length) * 100}%`
              }}
            />
          </div>

          <div className="space-y-8 sm:space-y-12 relative">
            {PHASES.map((phase, idx) => {
              const isActive = idx <= activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div 
                  key={phase.id}
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  onClick={() => setActiveStep(idx)}
                  className="flex items-start gap-5 sm:gap-8 cursor-pointer group"
                >
                  
                  {/* Circular Indicator with Smooth Spring Scale */}
                  <div className="relative z-10 shrink-0 mt-3 sm:mt-4">
                    <div 
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs ${
                        isActive 
                          ? 'bg-[#ff6b35] text-white ring-4 ring-[#ff6b35]/20 scale-105 shadow-md shadow-[#ff6b35]/25' 
                          : 'bg-[#f0ede8] text-[#706e6a] group-hover:bg-[#e2ded8] group-hover:scale-102'
                      }`}
                    >
                      {phase.badge}
                    </div>
                  </div>

                  {/* Content Card with Interactive Highlight */}
                  <div 
                    className={`flex-1 rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs ${
                      isCurrent 
                        ? 'border border-[#ff6b35]/50 shadow-md bg-[#f0ede8] ring-1 ring-[#ff6b35]/20 translate-x-1' 
                        : 'border border-[#f0ede8] bg-[#f0ede8]/60 hover:bg-[#f0ede8]/80 hover:border-[#e2ded8]'
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      {phase.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className={`text-lg sm:text-xl font-medium tracking-[-0.03em] leading-snug transition-colors duration-300 ${
                        isCurrent ? 'text-[#141412]' : 'text-[#141412]/90 group-hover:text-[#141412]'
                      }`}>
                        {phase.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                        {phase.description}
                      </p>
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
