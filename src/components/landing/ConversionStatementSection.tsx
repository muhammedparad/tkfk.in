'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';
import { TextScrollReveal } from '@/components/ui/TextScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useParticipantSession } from '@/hooks/useParticipantSession';

const HIGHLIGHT_WORDS = [
  { text: 'digital posters', bg: 'bg-violet-500/20', textCol: 'text-[#a78bfa]', border: 'border border-violet-500/30' },
  { text: 'creative ideas', bg: 'bg-violet-500/20', textCol: 'text-[#a78bfa]', border: 'border border-violet-500/30' },
  { text: 'national honors', bg: 'bg-violet-500/20', textCol: 'text-[#a78bfa]', border: 'border border-violet-500/30' },
];

export const ConversionStatementSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useParticipantSession();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HIGHLIGHT_WORDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const current = HIGHLIGHT_WORDS[index];

  return (
    <section className="py-20 md:py-28 bg-[#0f0f17] border-b border-white/5">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Statistics Row (3 Metrics with Smooth Counting Animation) */}
        <GsapReveal delay={0} duration={1.1} yOffset={35}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pb-20 border-b border-white/5 text-center">
            <div className="group">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight group-hover:text-[#a78bfa] transition-colors duration-300">
                <AnimatedCounter value={7001} prefix="₹" durationMs={1500} />
              </div>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 font-medium">
                First prize award for the winning digital poster entry
              </p>
            </div>

            <div className="group">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight group-hover:text-[#a78bfa] transition-colors duration-300">
                <AnimatedCounter value={36} suffix=" States & UTs" durationMs={1200} />
              </div>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 font-medium">
                Open to school, college, and youth creators across India
              </p>
            </div>

            <div className="group">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight group-hover:text-[#a78bfa] transition-colors duration-300">
                <AnimatedCounter value={100} suffix="%" durationMs={1200} />
              </div>
              <p className="text-xs sm:text-sm text-[#94a3b8] mt-2 font-medium">
                Verified digital certificates issued to all eligible submissions
              </p>
            </div>
          </div>
        </GsapReveal>

        {/* Large Conversion Headline with Animated Keyword Highlight */}
        <GsapReveal delay={0.1} duration={1.2} yOffset={45} scale={0.97}>
          <div className="pt-20 text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl lg:text-[58px] font-medium text-white tracking-[-0.04em] leading-[1.12]">
              <span>Stop waiting on the sidelines. Start creating </span>
              <span 
                className={`inline-block font-medium tracking-[-0.04em] px-4 py-1 sm:px-5 sm:py-1.5 rounded-2xl ${current.bg} ${current.border} ${current.textCol} transition-all duration-500 ease-out`}
              >
                {current.text}
              </span>
              <span className="tracking-[-0.04em]"> that inspire.</span>
            </h2>

            <TextScrollReveal
              text="One-time registration. Instant digital participant pass. Verified credentials and cash prize eligibility."
              className="text-sm sm:text-base text-[#94a3b8] max-w-lg mx-auto font-normal block"
              highlightWords={['registration', 'pass', 'credentials', 'prize']}
            />

            <div className="pt-2 flex justify-center">
              <Link
                href={mounted && isLoggedIn ? "/dashboard" : "/register"}
                className="group inline-flex items-center gap-2.5 pl-6 pr-2 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm shadow-sm hover:shadow-lg hover:shadow-violet-500/25 active:scale-95 transition-all duration-200"
              >
                <span>{mounted && isLoggedIn ? "Participant Portal" : "Register for Contest"}</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </div>
          </div>
        </GsapReveal>

      </div>
    </section>
  );
};
