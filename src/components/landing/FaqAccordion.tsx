'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "Who is eligible to participate in TKFK Gandhi Knowledge Challenge 2026?",
    a: "The competition is open to all citizens and participants across India."
  },
  {
    q: "How do I log into my participant account?",
    a: "You log in using your unique Participant ID (format: TKFK26-XXXXXX) along with your registered 10-digit phone number."
  },
  {
    q: "What is the format and duration of the quiz?",
    a: "The quiz consists of 50 multiple-choice questions (MCQs) with a total time limit of 25 minutes."
  },
  {
    q: "What happens if my internet connection drops during the quiz?",
    a: "Your answers auto-save to the server after every selection. If your connection drops, you can log back in and resume where you left off before the timer expires."
  },
  {
    q: "When will official results and certificates be available?",
    a: "Results undergo academic anti-fraud verification by TKFK officials and will be officially released on 5 October 2026. Verified PNG certificates will be unlocked on your dashboard."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100/60 px-3.5 py-1.5 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const btnId = `faq-btn-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>

                {isOpen && (
                  <div 
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className="px-6 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 bg-slate-50/50"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md p-1"
          >
            View All FAQ & Technical Specifications →
          </Link>
        </div>

      </div>
    </section>
  );
};
