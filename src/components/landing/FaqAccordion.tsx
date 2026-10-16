'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "Who is eligible to participate in TKFK competitions & programmes?",
    a: "Our programmes and competitions are open to all students, youth, and curious learners across India."
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
    <section className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-12">
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
