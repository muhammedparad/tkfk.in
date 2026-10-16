import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const ContactPromptSection: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-[#f8f5f0] border-b border-[#f0ede8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 text-center">
        <ScrollReveal delayMs={0} direction="up">
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#141412] tracking-tight">
              Something still unclear?
            </h3>

            <p className="text-sm sm:text-base text-[#706e6a] max-w-md mx-auto font-normal leading-relaxed">
              Reach out directly to our participant desk and we will get back to you promptly.
            </p>

            <div className="pt-2 flex justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                <span>Send a message</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#ff6b35] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
