import React from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const FEATURES = [
  'Full submission entry to Digital Poster Creation Contest 2026',
  'Instant official digital participant pass with live verification QR',
  'Complete design guidelines, format rules, and theme briefings',
  'Statewide multi-parameter jury evaluation and rank consideration',
  'Permanent verifiable digital certificate of active participation',
  'Cash prize eligibility up to ₹9,999 for top selected entries',
];

export const PricingOfferSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="pricing">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
              REGISTRATION & PASS
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              One simple entry. No subscriptions.
            </h2>

            <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed max-w-md mx-auto font-normal">
              No recurring fees, no locked stages. Pay once to compete, receive your verified ID pass, and access all programme benefits.
            </p>
          </div>
        </ScrollReveal>

        {/* Main Pricing Card */}
        <ScrollReveal delayMs={120} direction="up">
          <div className="max-w-xl mx-auto bg-[#f0ede8]/60 border border-[#f0ede8] rounded-[32px] p-8 sm:p-12 shadow-kairu space-y-8">
            
            <div className="space-y-4">
              <span className="text-[11px] font-mono text-[#ff6b35] tracking-[0.2em] uppercase font-semibold block">
                OFFICIAL CONTEST ACCESS
              </span>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-medium text-[#141412] tracking-[-0.04em]">
                  <AnimatedCounter value={99} prefix="₹" durationMs={1000} />
                </span>
                <span className="text-xs sm:text-sm text-[#706e6a] font-medium">
                  one-time registration
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal pt-1">
                Official entry for students and creative youth across India. Includes verified digital ID pass, jury review, cash prize eligibility, and lifetime verifiable certificate.
              </p>
            </div>

            {/* Checklist of Features */}
            <div className="space-y-3.5 pt-6 border-t border-[#f0ede8]">
              {FEATURES.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#141412] font-medium">
                  <div className="w-4 h-4 rounded-full bg-[#141412] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Full-Width Orange CTA Button */}
            <div className="pt-4">
              <Link
                href="/register"
                className="group w-full inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white py-4 rounded-full font-medium text-sm sm:text-base shadow-sm hover:shadow-lg hover:shadow-[#ff6b35]/25 active:scale-[0.98] transition-all duration-200"
              >
                <span>Register for Contest & Get Pass</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
