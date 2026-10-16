import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const HIGHLIGHTS = [
  {
    title: 'Accessible to every curious mind',
    desc: 'Free and affordable access to national level opportunities for learners from every corner of India.',
  },
  {
    title: 'Real-world intellectual challenges',
    desc: 'Fostering critical thinking, digital creation skills, historical context, and societal awareness.',
  },
  {
    title: 'Supportive learning cohort',
    desc: 'Grow alongside thousands of passionate peers, educators, mentors, and community organizers.',
  },
  {
    title: 'Verified credentials & recognition',
    desc: 'Instant official digital participant pass and verified credentials recognizing your active participation.',
  },
];

export const AboutCommunitySection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#f8f5f0] border-b border-[#f0ede8]" id="about-section">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Value Propositions */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-semibold text-[#ff6b35] tracking-widest uppercase block">
              ABOUT TKFK
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#141412] tracking-tight leading-[1.12]">
              A community built for curious minds.
            </h2>

            <p className="text-base text-[#706e6a] leading-relaxed font-normal">
              The Knowledge Forum Kerala is dedicated to creating inclusive, engaging, and enriching knowledge experiences for individuals across the country. We believe curiosity is the catalyst for personal growth, positive community action, and meaningful change.
            </p>

            {/* Checklist */}
            <div className="space-y-4 pt-2">
              {HIGHLIGHTS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#141412]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#706e6a] mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#141412] hover:bg-[#2a2a26] text-white px-6 py-3 rounded-full font-medium text-xs tracking-wide shadow-xs hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <span>Know More About TKFK</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ff6b35]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Illustration / Visual Card */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full max-w-[480px] rounded-[28px] p-2 bg-white/70 border border-[#f0ede8] shadow-kairu">
              <div className="rounded-[22px] overflow-hidden bg-white border border-[#f0ede8]">
                <Image
                  src="/images/about_illustration.png"
                  alt="TKFK Community Collaboration"
                  width={600}
                  height={500}
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="w-full h-auto object-contain select-none"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
