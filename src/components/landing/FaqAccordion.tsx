'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowUpRight } from 'lucide-react';

const FAQS = [
  {
    q: "Who is eligible to participate in TKFK competitions & programmes?",
    a: "The contest is open across all of India—anyone can participate regardless of age, school, college, or background."
  },
  {
    q: "How do I log into my participant account?",
    a: "You log in using your unique Participant ID (format: TKFK26-XXXXXX) along with your registered 10-digit phone number."
  },
  {
    q: "How do I submit entries or access active contests?",
    a: "Once registered, your participant portal provides direct access to contest submission guidelines, digital ID pass, and portal entry links."
  },
  {
    q: "Are official certificates provided for events?",
    a: "Yes, authentic digitally verifiable certificates and prizes are awarded to participants based on competition evaluation criteria."
  },
  {
    q: "How can I contact the TKFK team for assistance?",
    a: "You can reach out through our official support email or join our community desk via WhatsApp."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-24 bg-[#f8f5f0] text-[#141412] font-sans antialiased">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            COMMON QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#706e6a] max-w-md mx-auto">
            Everything you need to know about participation, verification, and our community.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const btnId = `faq-btn-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div 
                key={idx} 
                className="bg-white rounded-[22px] border border-[#f0ede8] overflow-hidden shadow-soft transition-all duration-200"
              >
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-medium text-[#141412] text-sm sm:text-base hover:text-[#ff6b35] transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full bg-[#f8f5f0] flex items-center justify-center shrink-0 border border-[#f0ede8] transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#ff6b35]/10 text-[#ff6b35]' : 'text-[#706e6a]'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div 
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#706e6a] leading-relaxed border-t border-[#f0ede8]"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#706e6a] hover:text-[#ff6b35] transition-colors"
          >
            <span>Have a different question? Reach out to support</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#ff6b35]" />
          </Link>
        </div>

      </div>
    </section>
  );
};
