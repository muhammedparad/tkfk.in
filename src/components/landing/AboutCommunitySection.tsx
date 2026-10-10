import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const HIGHLIGHTS = [
  {
    title: 'Accessible to everyone',
    desc: 'Free & affordable access to national level opportunities for learners from every corner.',
  },
  {
    title: 'Opportunities beyond academics',
    desc: 'Fostering real-world critical thinking, historical perspectives, and societal awareness.',
  },
  {
    title: 'A supportive learning community',
    desc: 'Grow alongside thousands of passionate peers, educators, and community leaders.',
  },
  {
    title: 'Certificates and recognition',
    desc: 'Official, verified credentials recognizing your active participation and milestones.',
  },
];

export const AboutCommunitySection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-50/50 border-b border-slate-100" id="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Value Propositions */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs sm:text-sm font-bold text-[#0066FF] tracking-wider uppercase block">
              ABOUT TKFK
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
              A Community for Curious Minds
            </h2>

            <p className="text-base text-slate-600 leading-relaxed font-normal">
              TKFK is dedicated to creating inclusive, engaging, and enriching knowledge experiences for individuals across the country. We believe curiosity is the catalyst for personal growth, positive community action, and meaningful change.
            </p>

            {/* Checklist */}
            <div className="space-y-4 pt-2">
              {HIGHLIGHTS.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0066FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0066FF]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
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
                className="inline-flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
              >
                <span>Know More About TKFK</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Illustration Collage */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full max-w-[500px]">
              <Image
                src="/images/about_illustration.png"
                alt="TKFK Community Collaboration"
                width={600}
                height={500}
                sizes="(max-width: 768px) 100vw, 500px"
                className="w-full h-auto object-contain rounded-2xl drop-shadow-sm select-none"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
