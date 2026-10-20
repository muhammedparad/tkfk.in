'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const WhoBuildsSection: React.FC = () => {
  return (
    <section 
      id="who-builds" 
      className="relative py-20 md:py-28 bg-[#faf7f2] border-b border-[#f0ede8] overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(20, 20, 18, 0.045) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(20, 20, 18, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }}
    >
      {/* Anchor for alternate #team link */}
      <div id="team" className="absolute -top-24 pointer-events-none" aria-hidden="true" />

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Centered Pill Badge: OUR TEAM */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="flex justify-center mb-12 sm:mb-16">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#fdeee7] text-[#ff6b35] text-[11px] font-bold tracking-[0.2em] uppercase shadow-2xs">
              OUR TEAM
            </span>
          </div>
        </ScrollReveal>

        {/* Main Content: Left Headline + Right 2 Team Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-5 space-y-6">
            <ScrollReveal delayMs={100} direction="right">
              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#141412] tracking-[-0.035em] leading-[1.1]">
                The people <br />
                behind{' '}
                <span className="inline-flex items-center px-4 py-0.5 rounded-2xl bg-[#fed8c7] text-[#141412] align-baseline">
                  TKFK
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed max-w-[360px] font-normal">
                A small team with a big belief — that curious young minds can create a brighter, more thoughtful Kerala.
              </p>
            </ScrollReveal>
          </div>

          {/* Right Column: 2 Team Cards Side by Side */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-6 lg:gap-8 items-end pt-4 sm:pt-0">
            
            {/* ========================================================
                CARD 1: MUHAMMED ASAD (FOUNDER)
            ======================================================== */}
            <ScrollReveal delayMs={150} direction="up">
              <div className="relative group max-w-[280px] sm:max-w-none mx-auto w-full">
                
                {/* Handwritten "Founder" note + Curved Arrow */}
                <div 
                  className="absolute -top-12 right-2 sm:right-5 z-20 pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <Image
                    src="/images/team/founder_badge.png"
                    alt="Founder"
                    width={75}
                    height={75}
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                </div>

                {/* Arch Background + Headshot Image */}
                <div className="relative w-full max-w-[220px] sm:max-w-[230px] mx-auto aspect-[4/5] rounded-t-[130px] overflow-hidden bg-[#feddcc] flex items-end justify-center shadow-2xs">
                  <Image
                    src="/images/team/asad.png"
                    alt="Muhammed Asad - Founder"
                    fill
                    sizes="(max-width: 640px) 240px, (max-width: 1024px) 230px, 260px"
                    className="object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>

                {/* Overlapping White Info Card */}
                <div className="relative z-10 -mt-10 sm:-mt-12 bg-white rounded-[24px] p-5 sm:p-6 border border-[#f0ede8] shadow-[0_8px_30px_rgba(20,20,18,0.04)] group-hover:shadow-[0_12px_36px_rgba(20,20,18,0.08)] group-hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight leading-snug truncate">
                        Muhammed Asad
                      </h3>
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#ff6b35] tracking-[0.2em] uppercase block mt-1">
                        FOUNDER
                      </span>
                    </div>

                    <div 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#fdeee7] flex items-center justify-center text-[#ff6b35] shrink-0 group-hover:bg-[#ff6b35] group-hover:text-white transition-colors duration-200"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] text-[#706e6a] leading-relaxed mt-3.5 font-normal">
                    Believes in the power of curiosity, creativity, and community to shape a better Kerala.
                  </p>
                </div>

              </div>
            </ScrollReveal>

            {/* ========================================================
                CARD 2: MUHAMMED MAHAMOOD (CO-FOUNDER)
            ======================================================== */}
            <ScrollReveal delayMs={220} direction="up">
              <div className="relative group max-w-[280px] sm:max-w-none mx-auto w-full">
                
                {/* Handwritten "Co-founder" note + Curved Arrow */}
                <div 
                  className="absolute -top-12 right-1 sm:right-3 z-20 pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <Image
                    src="/images/team/cofounder_badge.png"
                    alt="Co-founder"
                    width={95}
                    height={75}
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                </div>

                {/* Arch Background + Headshot Image */}
                <div className="relative w-full max-w-[220px] sm:max-w-[230px] mx-auto aspect-[4/5] rounded-t-[130px] overflow-hidden bg-[#feddcc] flex items-end justify-center shadow-2xs">
                  <Image
                    src="/images/team/mahamood.png"
                    alt="Muhammed Mahamood - Co-founder"
                    fill
                    sizes="(max-width: 640px) 240px, (max-width: 1024px) 230px, 260px"
                    className="object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                </div>

                {/* Overlapping White Info Card */}
                <div className="relative z-10 -mt-10 sm:-mt-12 bg-white rounded-[24px] p-5 sm:p-6 border border-[#f0ede8] shadow-[0_8px_30px_rgba(20,20,18,0.04)] group-hover:shadow-[0_12px_36px_rgba(20,20,18,0.08)] group-hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight leading-snug truncate">
                        Muhammed Mahamood
                      </h3>
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#ff6b35] tracking-[0.2em] uppercase block mt-1">
                        CO-FOUNDER
                      </span>
                    </div>

                    <div 
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#fdeee7] flex items-center justify-center text-[#ff6b35] shrink-0 group-hover:bg-[#ff6b35] group-hover:text-white transition-colors duration-200"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] text-[#706e6a] leading-relaxed mt-3.5 font-normal">
                    Builds programs, partnerships and opportunities for young learners to grow.
                  </p>
                </div>

              </div>
            </ScrollReveal>

          </div>

        </div>

      </div>
    </section>
  );
};
