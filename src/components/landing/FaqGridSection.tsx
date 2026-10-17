import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const FAQS = [
  {
    q: 'What is The Knowledge Forum Kerala (TKFK)?',
    a: 'TKFK is an open community and platform dedicated to youth development, creativity, learning, and constructive inquiry. We organize nationwide competitions, creative challenges, and workshops to help learners discover and showcase their potential.',
  },
  {
    q: 'What do I receive upon registering for the ₹99 contest pass?',
    a: 'Full submission entry to the Digital Poster Creation Contest 2026, an instant official digital participant pass with live verification QR, detailed creative guidelines, independent jury evaluation, and an official verifiable digital credential.',
  },
  {
    q: 'Who is eligible to participate across TKFK events?',
    a: 'The contest is open across all of India—anyone can participate. Students, youth, professionals, and creative learners of any age or background are welcome to enter.',
  },
  {
    q: 'Do I need advanced software like Photoshop or Illustrator?',
    a: 'You must use Adobe Photoshop. No other software is allowed for this competition, and your final output must adhere to high-resolution export standards.',
  },
  {
    q: 'When is the final submission deadline for the poster contest?',
    a: 'All digital poster entries must be uploaded via your participant portal by 15 November 2026, 11:59 PM IST. Early submissions are welcome and can be updated anytime before the deadline.',
  },
  {
    q: 'What is the refund and support policy?',
    a: 'We operate with complete transparency. In the event of duplicate transactions or payment discrepancies, our support desk processes full refunds within 5–7 business days upon verification.',
  },
];

export const FaqGridSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="faq">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
              FAQ
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
              Everything you need to know
            </h2>

            <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed max-w-md mx-auto font-normal">
              The questions we get most often. Answered directly.
            </p>
          </div>
        </ScrollReveal>

        {/* 2-Column Grid of Static Q&A Cards (Kairu Style with Interactive Focus & Click States) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {FAQS.map((item, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 60} direction="up">
              <div
                tabIndex={0}
                role="article"
                aria-label={item.q}
                className="h-full bg-[#f0ede8]/60 hover:bg-[#f0ede8]/90 focus:bg-[#f0ede8] border border-[#f0ede8] hover:border-[#ff6b35]/40 focus:border-[#ff6b35] rounded-[28px] p-7 sm:p-8 space-y-3 transition-all duration-300 shadow-2xs hover:shadow-xs focus-visible:ring-2 focus-visible:ring-[#ff6b35] focus-visible:outline-none cursor-default active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white border border-[#f0ede8] text-[#ff6b35] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    Q
                  </span>
                  <h3 className="text-base sm:text-lg font-medium text-[#141412] leading-snug tracking-[-0.03em]">
                    {item.q}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal pl-9">
                  {item.a}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
