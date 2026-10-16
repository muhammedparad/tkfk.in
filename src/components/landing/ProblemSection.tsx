import React from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const PROBLEMS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-110">
        <ellipse cx="24" cy="25" rx="16" ry="12" fill="#f5b49c" stroke="#141412" strokeWidth="2" />
        <circle cx="16" cy="22" r="1.5" fill="#141412" />
        <path d="M12 20c-2-2-4-1-5 1" stroke="#141412" strokeWidth="2" strokeLinecap="round" />
        <rect x="22" y="16" width="4" height="2" rx="1" fill="#141412" />
        <path d="M16 37v3M32 37v3" stroke="#141412" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 23c2 1 4 0 5-2" stroke="#141412" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Opportunities locked behind high barriers',
    description: 'Expensive registrations and metropolitan-only physical events keep thousands of deserving students across India unrepresented.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-110">
        <path d="M14 10h14l8 8v20a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" fill="#f5b49c" stroke="#141412" strokeWidth="2" />
        <path d="M28 10v8h8" stroke="#141412" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="18" y1="24" x2="30" y2="24" stroke="#141412" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="30" x2="26" y2="30" stroke="#141412" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Ideas that never leave the draft',
    description: 'You know what you want to create. You just never had a structured, deadline-driven path from an initial concept to a validated public entry.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-110">
        <path d="M12 20v8h6l12 7V13l-12 7h-6z" fill="#f5b49c" stroke="#141412" strokeWidth="2" />
        <path d="M34 18c2 2 2 8 0 10" stroke="#141412" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 28v6a2 2 0 0 0 2 2h2v-8" stroke="#141412" strokeWidth="2" />
      </svg>
    ),
    title: 'Great work that goes unnoticed',
    description: 'Most creative projects vanish quietly into classroom archives. Not because they lack brilliance, but because nobody showed the world.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 shrink-0 transition-transform duration-300 group-hover:scale-110">
        <rect x="18" y="10" width="12" height="12" rx="3" fill="#f5b49c" stroke="#141412" strokeWidth="2" />
        <circle cx="24" cy="16" r="2.5" fill="#141412" />
        <path d="M24 22v16M16 38h16" stroke="#141412" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Ambition without a community stage',
    description: 'You know Canva. You know Photoshop. You know digital storytelling. Nobody gave you a verified credential and a statewide cohort to grow with.',
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="why">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
              THE PROBLEM
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              Creating is the easy part. Getting recognized for it is not.
            </h2>

            <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed max-w-lg mx-auto font-normal">
              Most students who have real creative ability never receive public recognition. Not because they can&apos;t. Because nobody gave them a credible stage.
            </p>
          </div>
        </ScrollReveal>

        {/* 2x2 Grid of 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {PROBLEMS.map((item, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 100} direction="up">
              <div
                className="bg-[#f0ede8]/60 hover:bg-[#f0ede8] border border-[#f0ede8] hover:border-[#ff6b35]/40 rounded-[28px] p-7 sm:p-8 flex items-start gap-6 transition-all duration-300 shadow-2xs hover:shadow-sm hover:-translate-y-1 group cursor-default"
              >
                <div className="shrink-0 mt-1">
                  {item.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-medium text-[#141412] tracking-[-0.03em] leading-snug group-hover:text-[#ff6b35] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
