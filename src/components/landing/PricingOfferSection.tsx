'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useParticipantSession } from '@/hooks/useParticipantSession';

const FEATURES = [
  'Full submission entry to Digital Poster Creation Contest 2026',
  'Instant official digital participant pass with live verification QR',
  'Complete design guidelines, format rules, and theme briefings',
  'Independent multi-parameter jury evaluation and merit consideration',
  'Permanent verifiable digital certificate of active participation',
  'Cash prize eligibility up to ₹7,001 for top selected entries',
];

export const PricingOfferSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useParticipantSession();

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <section className="py-20 md:py-28 bg-[#0f0f17] border-b border-white/5" id="pricing">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-[#a78bfa] text-[11px] font-semibold tracking-[0.2em] uppercase">
              ACTIVE CHALLENGE PASS
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-[-0.04em] leading-[1.12]">
              One simple pass. Complete transparency.
            </h2>

            <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed max-w-md mx-auto font-normal">
              No recurring fees or hidden stages. Register once for ₹99 to receive your official ID pass, access contest guidelines, and join our active challenge.
            </p>
          </div>
        </GsapReveal>

        {/* Main Pricing Card */}
        <GsapReveal delay={0.12} duration={1.2} yOffset={45} scale={0.97}>
          <div className="max-w-xl mx-auto bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-violet-500/30 rounded-[32px] p-8 sm:p-12 shadow-[0_0_60px_rgba(124,58,237,0.2),0_20px_60px_rgba(0,0,0,0.6)] space-y-8">
            
            <div className="space-y-4">
              <span className="text-[11px] font-mono text-[#a78bfa] tracking-[0.2em] uppercase font-semibold block">
                FLAGSHIP CONTEST ENTRY
              </span>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-medium text-white tracking-[-0.04em]">
                  <AnimatedCounter value={99} prefix="₹" durationMs={1000} />
                </span>
                <span className="text-xs sm:text-sm text-[#94a3b8] font-medium">
                  one-time registration
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed font-normal pt-1">
                Official entry for students and creative youth across India. Includes verified digital ID pass, jury review, cash prize eligibility, and lifetime verifiable certificate.
              </p>
            </div>

            {/* Checklist of Features */}
            <div className="space-y-3.5 pt-6 border-t border-white/10">
              {FEATURES.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Full-Width Violet CTA Button */}
            <div className="pt-4">
              <Link
                href={mounted && isLoggedIn ? "/dashboard" : "/register"}
                className="group w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-full font-medium text-sm sm:text-base shadow-sm hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98] transition-all duration-200"
              >
                <span>{mounted && isLoggedIn ? "Go to Participant Portal" : "Register for Contest & Get Pass"}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

          </div>
        </GsapReveal>

      </div>
    </section>
  );
};
