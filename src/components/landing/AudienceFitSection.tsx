import React from 'react';
import { GraduationCap, Award, Palette, Users } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const AUDIENCES = [
  {
    icon: GraduationCap,
    category: 'School Students (Classes 6–12)',
    description: 'Discover your creative confidence early. Compete on a statewide stage, represent your school, and earn verified credentials that establish your extracurricular distinction.',
  },
  {
    icon: Award,
    category: 'College & University Students',
    description: 'Build an authentic, demonstrable digital portfolio. Compete for cash prizes up to ₹9,999 and enhance your academic profile with official jury-evaluated achievements.',
  },
  {
    icon: Palette,
    category: 'Aspiring Designers & Digital Artists',
    description: 'Sharpen your visual communication. Test your poster framing, typography, and concept execution against clear criteria evaluated by industry mentors.',
  },
  {
    icon: Users,
    category: 'Lifelong Knowledge Seekers & Educators',
    description: 'Support youth education, volunteer across regional chapters, contribute creative themes, and help nurture curious minds across every district.',
  },
];

export const AudienceFitSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Asymmetric Section Heading */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-16 sm:mb-20">
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-[0.2em] uppercase block">
                WHO THIS IS FOR
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
                Built for people who are done waiting
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed font-normal">
                Honest answer: this is built for individuals who take their intellectual and creative growth seriously. Here is who gets the most out of it.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Kairu Signature Sticky Stacking Cards (Deck Effect) */}
        <div className="relative pb-12 space-y-8 sm:space-y-10">
          {AUDIENCES.map((item, idx) => {
            const Icon = item.icon;
            // Subtle organic tilt matching Framer's matrix transforms
            const tilts = ['rotate-0', 'sm:rotate-[1.5deg]', 'sm:rotate-[-1deg]', 'sm:rotate-[0.8deg]'];
            const tiltClass = tilts[idx % tilts.length];
            return (
              <div 
                key={idx} 
                className={`sticky top-[110px] sm:top-[140px] transition-transform duration-300 ${tiltClass}`}
                style={{ zIndex: idx + 1 }}
              >
                <div
                  className="bg-[#f0ede8] border border-[#e5e1da] rounded-[28px] p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 shadow-card hover:shadow-kairu transition-all duration-300 group cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e1da] group-hover:border-[#ff6b35]/40 group-hover:bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35] shrink-0 group-hover:scale-105 transition-all duration-300 shadow-2xs">
                    <Icon className="w-7 h-7" strokeWidth={1.8} />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <span className="text-[11px] font-mono text-[#9c9a97] uppercase tracking-wider block">
                      Target Group 0{idx + 1}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-medium text-[#141412] tracking-[-0.03em] group-hover:text-[#ff6b35] transition-colors">
                      {item.category}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal max-w-2xl">
                      {item.description}
                    </p>
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
