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
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-widest uppercase block">
                WHO THIS IS FOR
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141412] tracking-tight leading-[1.12]">
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

        {/* 4 Vertically Stacked Cards */}
        <div className="space-y-4 sm:space-y-5">
          {AUDIENCES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} delayMs={idx * 80} direction="up">
                <div
                  className="bg-[#f0ede8]/60 hover:bg-[#f0ede8] border border-[#f0ede8] hover:border-[#ff6b35]/40 rounded-[28px] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 transition-all duration-300 shadow-2xs hover:shadow-xs group cursor-default hover:-translate-x-1"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#f0ede8] group-hover:border-[#ff6b35]/30 group-hover:bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35] shrink-0 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-[#141412] group-hover:text-[#ff6b35] transition-colors">
                      {item.category}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
