'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const HIGHLIGHT_WORDS = [
  { text: 'digital posters', bg: 'bg-[#f5b49c]/40', textCol: 'text-[#141412]' },
  { text: 'creative ideas', bg: 'bg-[#ffe09a]/60', textCol: 'text-[#141412]' },
  { text: 'national honors', bg: 'bg-[#bce8f5]/60', textCol: 'text-[#141412]' },
];

export const ConversionStatementSection: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HIGHLIGHT_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const current = HIGHLIGHT_WORDS[index];

  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Statistics Row (3 Metrics with Smooth Counting Animation) */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pb-20 border-b border-[#f0ede8] text-center">
            <div className="group">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#141412] tracking-tight group-hover:text-[#ff6b35] transition-colors duration-300">
                <AnimatedCounter value={50000} prefix="₹" suffix="+" durationMs={1800} />
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-2 font-medium">
                Cash awards and merit scholarships distributed
              </p>
            </div>

            <div className="group">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#141412] tracking-tight group-hover:text-[#ff6b35] transition-colors duration-300">
                <AnimatedCounter value={14} suffix=" Districts" durationMs={1200} />
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-2 font-medium">
                Active school and college chapters across Kerala & India
              </p>
            </div>

            <div className="group">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#141412] tracking-tight group-hover:text-[#ff6b35] transition-colors duration-300">
                <AnimatedCounter value={99.2} suffix="%" decimals={1} durationMs={1500} />
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-2 font-medium">
                Instant digital ID passes and verified certificates issued
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Large Conversion Headline with Animated Keyword Highlight */}
        <ScrollReveal delayMs={100} direction="up">
          <div className="pt-20 text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl lg:text-[58px] font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              <span>Stop waiting on the sidelines. Start creating </span>
              <span 
                className={`inline-block font-medium tracking-[-0.04em] px-4 py-1 sm:px-5 sm:py-1.5 rounded-2xl ${current.bg} ${current.textCol} transition-all duration-500 ease-out`}
              >
                {current.text}
              </span>
              <span className="tracking-[-0.04em]"> that inspire.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#706e6a] max-w-lg mx-auto font-normal">
              One-time registration. Instant digital ID pass. Verified certificates and cash prize eligibility.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 pl-6 pr-2 py-2 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-sm shadow-sm hover:shadow-lg hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200"
              >
                <span>Get access for ₹99</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
