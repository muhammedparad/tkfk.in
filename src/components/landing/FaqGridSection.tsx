import React from 'react';
import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'What do I receive upon registering for ₹99?',
    a: 'Full entry into the Digital Poster Creation Contest 2026, an instant official digital participant pass with live verification QR, detailed creative guidelines, statewide jury evaluation, and an official verifiable digital credential.',
  },
  {
    q: 'Do I need advanced software like Photoshop or Illustrator?',
    a: 'No. You are free to design using Canva, Figma, Procreate, Illustrator, or any digital application of your choice, provided your final output adheres to the high-resolution file standards (JPG, PNG, or PDF).',
  },
  {
    q: 'Who is eligible to participate?',
    a: 'The competition is open nationwide to all school students (Classes 6–12), college and university learners, and creative youth across India. There are no geographical restrictions within India.',
  },
  {
    q: 'When is the final submission deadline?',
    a: 'All digital poster entries must be uploaded via your participant portal by 15 November 2026, 11:59 PM IST. Early submissions are welcome and can be updated anytime before the deadline.',
  },
  {
    q: 'How will the submissions be evaluated?',
    a: 'An independent panel of design educators and cultural mentors evaluates submissions across four criteria: conceptual originality (30%), visual composition (30%), typography and clarity (20%), and execution quality (20%).',
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
        <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-widest uppercase">
            FAQ
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141412] tracking-tight leading-[1.12]">
            Everything you need to know
          </h2>

          <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed max-w-md mx-auto font-normal">
            The questions we get most often. Answered directly.
          </p>
        </div>

        {/* 2-Column Grid of Static Q&A Cards (Kairu Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {FAQS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f0ede8]/60 hover:bg-[#f0ede8]/90 border border-[#f0ede8] rounded-[28px] p-7 sm:p-8 space-y-3 transition-all duration-300 shadow-2xs hover:shadow-xs"
            >
              <h3 className="text-base sm:text-lg font-bold text-[#141412] leading-snug">
                {item.q}
              </h3>
              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                {item.a}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
